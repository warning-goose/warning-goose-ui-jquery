
NAME=warning-goose

help:

all:

node_modules:
	npm install
	
build-dev: node_modules ## Build CSS for development (with source-map)
	$$(npm bin)/node-sass \
		--source-map-embed \
		--include-path scss \
		scss/main.scss \
		css/style.css

build-prod: node_modules ## Build CSS for production
	$$(npm bin)/node-sass \
		--include-path scss \
		scss/main.scss \
		css/style.css

watch: node_modules ## Watch directory for changes & build CSS for development
	$$(npm bin)/nodemon -e scss -x "$(MAKE) build-dev"

extension: $(NAME).xpi ## Build XPI extension

clean: ## Clean temporary files & XPI
	rm -f $(NAME).xpi

help: ## Show this help
	@echo "Usage: make <target>"
	@echo ""
	@echo "With one of following targets:"
	@awk 'BEGIN {FS = ":.*?## "} \
  	  /^[a-zA-Z_-]+:.*?## / \
  	  { sub("\\\\n",sprintf("\n%22c"," "), $$2); \
    	printf("\033[36m%-20s\033[0m %s\n", $$1, $$2); \
  	  }' $(MAKEFILE_LIST)

$(NAME).xpi: node_modules css/style.css
	git archive --format zip --output $(NAME).zip HEAD
	mv $(NAME).zip $(NAME).xpi

.PHONY: extension build-dev build-prod watch

