import {createPost, getFollowers, getLikedTweets, getRecentTweetsByUserId, getUserByUsername} from "./mcp.tool.js"
import { z } from "zod";

export async function registerTools(server){
    server.tool(
        "addTwoNumbers",
        "Add two numbers",
        {
            a: z.number(),
            b: z.number()
        },
        async (arg) => {
            const { a, b } = arg;
            return {
                content: [
                    {
                        type: "text",
                        text: `The sum of ${a} and ${b} is ${a + b}`
                    }
                ]
            }
        }
    )
    
    
    server.tool(
        "createPost",
        "Create a post on X (formerly known as Twitter)",
        {
            status: z.string()
        },
        async ({ status }) => {
            return createPost(status);
        }
    );
    
    // 2. Get User by Username
    server.tool(
        "getUserByUsername",
        "Get a user's information by Twitter username",
        {
            username: z.string()
        },
        async ({ username }) => {
            return getUserByUsername(username);
        }
    );
    // 3. Get Recent Tweets by User ID
    server.tool(
        "getRecentTweetsByUserId",
        "Get recent tweets by a Twitter user ID",
        {
            userId: z.string(),
            count: z.number().min(1).max(100)  // Remove `.default(5)` here
        },
        async ({ userId, count }) => {
            // Ensure default is applied if not provided
            const finalCount = count || 5;  // Default to 5 if `count` is undefined or 0
            return getRecentTweetsByUserId(userId, finalCount);
        }
    );
    
    // 4. Search Tweets
    server.tool(
        "searchTweets",
        "Search for recent tweets by keyword",
        {
            query: z.string(),
            count: z.number().min(1).max(100)  // Remove `.default(5)` here
        },
        async ({ query, count }) => {
            // Ensure default is applied if not provided
            const finalCount = count || 5;  // Default to 5 if `count` is undefined or 0
            return searchTweets(query, finalCount);
        }
    );
    
    // 5. Get Liked Tweets
    server.tool(
        "getLikedTweets",
        "Get recent liked tweets by a user ID",
        {
            userId: z.string(),
            count: z.number().min(1).max(100)  // Remove `.default(5)` here
        },
        async ({ userId, count }) => {
            // Ensure default is applied if not provided
            const finalCount = count || 5;  // Default to 5 if `count` is undefined or 0
            return getLikedTweets(userId, finalCount);
        }
    );
    
    // 6. Get Followers
    server.tool(
        "getFollowers",
        "Get followers of a Twitter user by user ID",
        {
            userId: z.string(),
            count: z.number().min(1).max(100)  // Remove `.default(5)` here
        },
        async ({ userId, count }) => {
            // Ensure default is applied if not provided
            const finalCount = count || 5;  // Default to 5 if `count` is undefined or 0
            return getFollowers(userId, finalCount);
        }
    );
}