NAME=$(shell basename "$$(pwd)")

all:

distclean:

zip: distclean
	git archive --format zip --output $(NAME).zip HEAD
