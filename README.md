# sensitive-data-leak-prevention

> A data loss prevention app built with [Probot](https://github.com/probot/probot) exclusively for Github Issues.
> The bot utilizes github webhooks to scan newly posted issues, scan them and upon detecting instances of certain regular expressions, delete the issue and re-post it without them.

## Setup

```sh
# Install dependencies
npm install probot

# Run the bot
npm start
```


