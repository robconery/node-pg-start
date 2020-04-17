web:
	DEBUG=010:* npm run start

css:
	npm run css

sense:
	open https://$(APPNAME).scm.azurewebsites.net

logs:
	open https://$(APPNAME).scm.azurewebsites.net/api/logstream

restart:
	az webapp stop -g $(RG) -n $(APPNAME)
	az webapp start -g $(RG) -n $(APPNAME)

deploy:
	git commit -am "Deployment $(shell date)"
	git push azure master

.PHONY: css