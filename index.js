// Import required modules
const { TwitterApi } = require('twitter-api-v2');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');

// Initialize OpenAI and Twitter API clients
const openai = new OpenAI({ api_key: process.env.OPENAI_API_KEY });
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// Define an array of prompts
const imagePrompts = [
    "A game asset concept image of a 3d low poly battle jet in anime style art flying in outer-space amongst the stars and cosmos in the distance.",
    "A game asset concept image of a ai robot space species that have a crystal in their forehead, in anime/manga style art.",
    "A game asset concept image of a red blue and green crystals from space in all shapes and sizes,some glow some are dead, in anime/manga style art."
  ];

// Function to generate an image using DALL-E 3
async function generateImage(prompt) {
  const response = await openai.images.generate({
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    model: "dall-e-3"
  });
  const imageUrl = response.data[0].url;
  return imageUrl;
}

// Function to download and save image locally
async function downloadImage(url, path) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });
  response.data.pipe(fs.createWriteStream(path));
  return new Promise((resolve, reject) => {
    response.data.on('end', () => resolve(path));
    response.data.on('error', reject);
  });
}

// Function to generate tweet text
async function generateTweetText(imagePrompt) {
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { "role": "system", "content": "You are a creative AI specialized in generating concise, engaging tweets with hashtags for posts featuring concept images for Galaxy Royale: Ikinokoru." },
      { "role": "user", "content": `Create a tweet for an image described as: "${imagePrompt}"` }
    ],
    max_tokens: 50
  });
  return gptResponse.choices[0].message.content.trim();
}

// Main Lambda handler
exports.handler = async (event) => {
  try {
    const imagePrompt = imagePrompts[Math.floor(Math.random() * imagePrompts.length)];
    console.log('Generating image with prompt:', imagePrompt);
    const imageUrl = await generateImage(imagePrompt);
    console.log('Image generated with URL:', imageUrl);
    const imagePath = '/tmp/image.png';
    await downloadImage(imageUrl, imagePath);
    console.log('Image generated with URL:', imageUrl);

    const tweetText = await generateTweetText(imagePrompt);

    // Add a prefix to the tweet text
    const finalTweetText = `Galaxy Royale: Ikinokoru - AI CONCEPT ART: ${tweetText}`;

    const mediaId = await twitterClient.v1.uploadMedia(imagePath);
    const tweetResponse = await twitterClient.v2.tweet(finalTweetText, { media: { media_ids: [mediaId] } });

    if (tweetResponse && tweetResponse.data) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Image and tweet posted successfully!', tweetId: tweetResponse.data.id })
      };
    } else {
      throw new Error('Failed to post the image and tweet.');
    }
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred.', error: error.message })
    };
  }
};
