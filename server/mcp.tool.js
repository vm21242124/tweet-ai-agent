import { config } from "dotenv"
import { TwitterApi } from "twitter-api-v2"
config()


const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

export async function createPost(status) {
    const newPost = await twitterClient.v2.tweet(status)

    return {
        content: [
            {
                type: "text",
                text: `Tweeted: ${status}`
            }
        ]
    }
}
export async function getUserByUsername(username) {
    const user = await twitterClient.v2.userByUsername(username);

    return {
        content: [
            {
                type: "text",
                text: `User: @${user.data.username} (ID: ${user.data.id}) — ${user.data.name}`
            }
        ]
    };
}

export async function getRecentTweetsByUserId(userId, count = 5) {
    const tweets = await twitterClient.v2.userTimeline(userId, { max_results: count });

    const texts = tweets.data?.map(t => `• ${t.text}`) ?? ["No tweets found."];

    return {
        content: [
            {
                type: "text",
                text: `Recent tweets:\n${texts.join('\n')}`
            }
        ]
    };
}


export async function searchTweets(query, count = 5) {
    const results = await twitterClient.v2.search(query, { max_results: count });

    const tweets = results.data?.map(t => `• ${t.text}`) ?? ["No tweets found."];

    return {
        content: [
            {
                type: "text",
                text: `Search results for "${query}":\n${tweets.join('\n')}`
            }
        ]
    };
}


export async function getLikedTweets(userId, count = 5) {
    const liked = await twitterClient.v2.userLikedTweets(userId, { max_results: count });

    const texts = liked.data?.map(t => `• ${t.text}`) ?? ["No likes found."];

    return {
        content: [
            {
                type: "text",
                text: `Recent likes:\n${texts.join('\n')}`
            }
        ]
    };
}

export async function getFollowers(userId, count = 5) {
    const followers = await twitterClient.v2.followers(userId, { max_results: count });

    const names = followers.data?.map(u => `• @${u.username} (${u.name})`) ?? ["No followers found."];

    return {
        content: [
            {
                type: "text",
                text: `Followers:\n${names.join('\n')}`
            }
        ]
    };
}
