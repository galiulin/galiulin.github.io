для добавление сертификата на три месяца, выполнить команды:

sudo add-apt-repository ppa:certbot/certbot

sudo apt install python-certbot-nginx

sudo certbot --nginx -d DOMAIN_NAME
