
NAME=warning-goose
CSS_SOURCES=$(wildcard scss/**/*.scss)
# JS_SOURCES=$(wildcard js/**/*.js)

help:

all:

node_modules:
	npm install
	
build/css/style-dev.css: node_modules $(CSS_SOURCES)
	mkdir -p build/css
	$$(npm bin)/node-sass \
		--source-map-embed \
		--include-path scss \
		scss/main.scss \
		build/css/style-dev.css

build/css/style-prod.css: node_modules $(CSS_SOURCES)
	mkdir -p build/css
	$$(npm bin)/node-sass \
		--include-path scss \
		scss/main.scss \
		build/css/style-prod.css

css-dev: build/css/style-dev.css ## Build CSS for development (with source-map)
	cp build/css/style-dev.css build/css/style.css

css-prod: build/css/style-prod.css ## Build CSS for production
	cp build/css/style-prod.css build/css/style.css

js-common:
	# prepare dir
	mkdir -p build/js
	cp -a js/*.js build/js
	# remove templates
	find build/js/ -name '_*.js' -exec rm -f {} \;

build/js/app-dev.js: js/_app.js
	mkdir -p build/js
	sed -e 's|__ENVIRONMENT__|"development"|' \
		js/_app.js \
		> build/js/app-dev.js

build/js/app-prod.js: js/_app.js
	mkdir -p build/js
	sed -e 's|__ENVIRONMENT__|"production"|' \
		js/_app.js \
		> build/js/app-prod.js

js-dev: build/js/app-dev.js js-common ## Build JS for development
	cp build/js/app-dev.js build/js/app.js

js-prod: build/js/app-prod.js js-common ## Build JS for production
	cp build/js/app-prod.js build/js/app.js

watch: node_modules ## Watch directory for changes & build CSS for development
	$$(npm bin)/nodemon -e scss \
		-x "$(MAKE) css-dev"

clean: ## Clean temporary files & artifacts
	rm -f build/*
	rm -f web-ext-artifacts/*.zip

help: ## Show this help
	@echo "Usage: make <target>"
	@echo ""
	@echo "With one of following targets:"
	@awk 'BEGIN {FS = ":.*?## "} \
  	  /^[a-zA-Z_-]+:.*?## / \
  	  { sub("\\\\n",sprintf("\n%22c"," "), $$2); \
    	printf("\033[36m%-20s\033[0m %s\n", $$1, $$2); \
  	  }' $(MAKEFILE_LIST)

test-dev: node_modules css-dev js-dev ## Test dev extension in browser
	web-ext run --verbose --browser-console

test-prod: node_modules css-prod js-prod ## Test prod extension in browser
	web-ext run --verbose --browser-console

build: node_modules css-prod js-prod ## Build extension for production
	web-ext build --overwrite-dest

.PHONY: extension build test-dev test-prod watch help clean js-common

