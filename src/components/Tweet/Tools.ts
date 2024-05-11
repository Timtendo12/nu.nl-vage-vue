import { TweetOptions, Twttr } from '@/components/Tweet/Tweet';

let addScriptPromise: Promise<Twttr> | null = null;

export const addPlatformScript = (src: string): Promise<Twttr> => {
  if (!addScriptPromise) {
    const script = document.createElement('script');
    script.setAttribute('src', src);
    document.body.appendChild(script);
    addScriptPromise = new Promise((resolve) => {
      script.onload = () => {
        resolve(window.twttr);
      };
    });
  }
  return addScriptPromise;
};

export const createTweet = (el: HTMLElement, tweetId: string, options: TweetOptions): Promise<HTMLElement> =>
  new Promise(async (resolve, reject) => {
    try {
      const twttr = await Promise.resolve(window.twttr || addPlatformScript('//platform.twitter.com/widgets.js'));
      const tweet = await twttr.widgets.createTweet(tweetId, el, options);
      resolve(tweet);
    } catch (e) {
      reject(new Error(`Failed to load tweet: '${tweetId}', ${e}`));
    }
  });
