
all:

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

zip: node_modules css/style.css
	git archive --format zip --output dt-warning-goose.zip HEAD
	mv dt-warning-goose.zip dt-warning-goose.xpi

.PHONY: zip build-dev build-prod watch

