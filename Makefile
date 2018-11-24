
NAME=warning-goose

all:

extension: $(NAME).xpi

node_modules:
	npm install
	
watch: node_modules
	$$(npm bin)/nodemon -e scss -x "$(MAKE) build-dev"

build-dev: node_modules
	$$(npm bin)/node-sass \
		--source-map-embed \
		--include-path scss \
		scss/main.scss \
		css/style.css

build-prod: node_modules
	$$(npm bin)/node-sass \
		--include-path scss \
		scss/main.scss \
		css/style.css

$(NAME).xpi: node_modules css/style.css
	git archive --format zip --output $(NAME).zip HEAD
	mv $(NAME).zip $(NAME).xpi

clean: 
	rm -f $(NAME).xpi

.PHONY: extension build-dev build-prod watch

