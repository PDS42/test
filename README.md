This test can be executed with the following command: `npm install && node index.mjs`

A few thoughts I'd like to share on this:

- You will notice that I've commited my '.env' file & my private key. Those are obviously not things you would want to commit, but for the sake of the test, they need to be here.

- I've struggled early on, because I thought I'd be able to tackle this test using API calls only.
After quite some time & digging, I've realised that I would need to open a browser to get my authorization code at some point.
I chose Puppeteer for that, because Pola mentionned it in our discussion, and I know that you guys use it.
I ran into some issues setting it up on my mac (certificates issues with Chromium), and had to learn it since I had never used it before.
It was a fun experience, and I learned a lot !

- As Pola mentionned that I shouldn't be spending days on this, I chose to not add tests, and proper error handling (as they would be in a real application).
I'd be happy to discuss their potential implementation with you, as well as some tips on what I could have done better.
I'm always looking to improving & getting feedback, so this would be much appreciated, regardless of what happens next!

To give you an idea, I've spent around 1 full day on this, maybe a couple more hours (I still had to work on my current job).
