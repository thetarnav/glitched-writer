# Contributing

First of all thank you for wanting to help me improve Glitched Writer package.

## Before you start

It's up to you, but if you are planning on adding some new feature, option or preset, you probably should notify me first. By creating new [discussion](https://github.com/thetarnav/glitched-writer/discussions) or [issue](https://github.com/thetarnav/glitched-writer/issues).

So we can discuss it up front, instead of me refusing to merge a PR, after you've spend your time making changes, just because I didn't like the changes.

If the changes are only improvements tho, you are free to get coding I think.

## Clone

First, clone the repo onto your local machine.

```cmd
git clone https://github.com/thetarnav/glitched-writer.git
cd glitched-writer
```

Then, install all the dev dependencies.

```cmd
npm i
```

## Development

Start a local server:

```cmd
npm run dev
```

When you open `localhost:8080`, you should see a scuffed page serving as a testing field for package features.

Code for operating it is in the `dev` directory.

## Pull Requests

For new features and stuff, it would be nice to see them working online. You can do that by creating a JSFiddle using minified js file from your fork.

```
https://rawgit.com/<YOUR GITHUB USERNAME>/glitched-writer/<YOUR BRANCH NAME>/lib/index.min.js
```

If you'd rather just describe your ideas and changes through words, then go for it. I will test them anyway, but it would be nice to know what to look for.

Thank you
