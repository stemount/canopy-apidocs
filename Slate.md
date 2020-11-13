This doc is powered by [Slate](https://github.com/slatedocs/slate)

Link to docs: https://insurestreetltd.github.io/canopy-apidocs/

## Dependencies

Minimally, you will need the following:

- [Ruby](https://www.ruby-lang.org/en/) >= 2.3
- [Bundler](https://bundler.io/)
- [NodeJS](https://nodejs.org/en/)

### Installing Dependencies on Ubuntu 18.04+

Install Ruby, NodeJS, and tools for compiling native ruby gems:

```bash
sudo apt install ruby ruby-dev build-essential libffi-dev zlib1g-dev liblzma-dev nodejs patch
```

Update RubyGems and install bundler:

```bash
sudo gem update --system
sudo gem install bundler
```

### Installing Dependencies on macOS

First, install [homebrew](https://brew.sh/), then install xcode command line tools:

```bash
xcode-select --install
```

Agree to the Xcode license:

```bash
sudo xcodebuild -license
```

Install nodejs runtime:

```bash
brew install node
```

Update RubyGems and install bundler:

```bash
gem update --system
gem install bundler
```

## Getting Set Up

Run following command to install ruby gems:

```
bundle install
```

## Makign changes in docs

Source code is stored in the `source` directory. Check `index.html.md` to see main docs structure.

## Running slate

You can run slate in two ways, either as a server process for development, or just build html files.

To do the first option, run:

```bash
bundle exec middleman server
```

and you should see your docs at http://localhost:4567.

The second option (building html files), run:

```bash
bundle exec middleman build
```

## Deployment

To deploy changes to github pages run `./deploy.sh` script. This will run build process and push changes into `gh-pages` branch, which is used as source branch for docs.
