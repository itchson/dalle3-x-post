# DALLE3-X-POST

This project is an AWS Lambda function designed to generate and tweet daily AI-generated game art assets. It utilizes OpenAI's DALL-E 3 for image generation and the Twitter API for tweeting, aimed at providing free resources for game developers.

## Features

- Automatically generates high-quality pixel inspired game art assets tailored for a wide range of game development needs.
- Tweets the generated art assets daily with engaging captions and relevant hashtags to foster community engagement.

## Prerequisites

- Node.js installed on your local machine.
- Access to OpenAI API and Twitter API credentials.
- An AWS account to deploy the Lambda function.

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/itchson/dalle3-x-post.git
cd dalle3-x-post
```

### Install Dependencies

```bash
npm install twitter-api-v2 openai axios fs
```

### Configure AWS Lambda Environment Variables

Configure your environment variables directly in the AWS Lambda console:

1. Navigate to your Lambda function in the AWS Management Console.
2. Go to the **Configuration** tab and select **Environment variables**.
3. Add the following key-value pairs:
   - `OPENAI_API_KEY`: Your OpenAI API key.
   - `TWITTER_CONSUMER_KEY`: Your Twitter consumer API key.
   - `TWITTER_CONSUMER_SECRET`: Your Twitter consumer API secret key.
   - `TWITTER_ACCESS_TOKEN_KEY`: Your Twitter access token.
   - `TWITTER_ACCESS_TOKEN_SECRET`: Your Twitter access token secret.

### Deploy to AWS Lambda

Deploy your function by uploading it to AWS Lambda. You can set a trigger based on a schedule using AWS CloudWatch to run the function automatically.

## Usage

Once deployed and scheduled, the Lambda function will automatically:

1. Select a prompt from a predefined list.
2. Generate an image using DALL-E 3.
3. Download and tweet the generated image with an engaging caption.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Acknowledgments

- OpenAI for the DALL-E 3 API.
- Twitter for the Twitter API.
- The indie game development community for inspiration.
