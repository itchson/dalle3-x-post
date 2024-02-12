// Import required modules
const { TwitterApi } = require('twitter-api-v2');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');

// Initialize OpenAI and Twitter API clients
const openai = new OpenAI({ api_key: process.env.OPENAI_API_KEY });
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// Array of prompts
const imagePrompts = [
    "2D Game Asset Pack, Mulitple Pixel Characters",

    "2D Game Asset Pack, Multiple Pixel items and and objects",

    "2D Game Asset Pack, Multiple Pixel scenarios and backgrounds",

    "2D Game Asset Pack, Multiple Pixel UI elements and icons",

    "2D Game Asset Pack, Multiple Pixel Monsters and Enemies",

    "2D Game Asset Pack, Multiple Pixel fonts and text",
  ];

// Function to generate an image using DALL-E 3
async function generateImage(prompt) {
  const response = await openai.images.generate({
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
    model: "dall-e-3"
  });
  const imageUrl = response.data[0].url;
  return imageUrl;
}

// Function to resize and compress image
async function resizeAndCompressImage(imagePath, outputImagePath) {
  await sharp(imagePath)
      .resize({ width: 1200, withoutEnlargement: true }) // Resize to width of 1200px
      .jpeg({ quality: 80 }) // Convert to JPEG format with quality 80
      .toFile(outputImagePath);
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
      { "role": "system", "content": "You are a creative AI specialized in generating a short engaging title, for tweets and add 4 hashtags for posts featuring images of an AI generated 2D Game Asset packs for free." },
      { "role": "user", "content": `Create a short tweet title for our free game asset pack described as: "${imagePrompt}"` } 
    ],
    max_tokens: 40
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

    // Resize and compress the image  
    const resizedImagePath = '/tmp/resized-image.jpg';
    await resizeAndCompressImage(imagePath, resizedImagePath);

    const tweetText = await generateTweetText(imagePrompt);

    // Add a prefix and affix to the tweet text
    const finalTweetText = `🎮 FREE AI GENERATED GAME ASSET PACKS: ${tweetText} FOLLOW FOR MORE DAILY! 🚀`;

    const mediaId = await twitterClient.v1.uploadMedia(resizedImagePath);
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
