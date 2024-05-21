import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import AuthState from './model/authState';
import User from './model/user';
import connectDB from './lib/connectDB';
dotenv.config();


const app: Express = express();

const twitterClient = new TwitterApi({
  clientId: process.env.TWEETER_API_KEY as string,
  clientSecret: process.env.TWEETER_API_KEY_SECRET as string
})

const callbackURL = "http://localhost:8000/callback"
app.get("/auth", async (req, res) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
  )
  await AuthState.create({ codeVerifier, state });
  res.redirect(url);
})

app.get("/callback", async (req, res) => {

  const { state, code } = req.query;
  const data = await AuthState.findOne({ state });

  if (!data) {
    return res.status(400).send("Invalid tokens or states")
  };

  const { client, accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
    code: code as string,
    codeVerifier: data.codeVerifier as string,
    redirectUri: callbackURL
  })

  const user = await User.create({ accessToken, refreshToken })
  res.json({ msg: "hello" });
})

app.get("/tweet", async (req, res) => {

  const refreshToken = "NS1uM2JEdGlxZXIwMVRES0JNdEl3S1MzZkJlaGltdlZlN2pDMFVKMHk4V1VYOjE3MTYzMDYyNzAwNDY6MToxOnJ0OjE";
  // const refreshToken = req.user.refreshToken;


  const { client, accessToken, refreshToken: newRefreshToken } = await twitterClient.refreshOAuth2Token(refreshToken);

  await User.findOneAndUpdate({ refreshToken }, { accessToken, refreshToken: newRefreshToken });

  const { data } = await client.v2.tweet("this tweet is from tweeter API");

  res.send(data);

})

const port = process.env.PORT || 8000;
// const httpsPort = 443
const start = async () => {
  try {
    if (process.env.MONGO_URL) {
      await connectDB(process.env.MONGO_URL);
      app.listen(port, () =>
        console.log(
          `⚡️[server]: Server iS running at http://localhost:${port} as well as connected with database`
        )
      );
    }


  } catch (error) {
    console.log(error);
  }
};
start();