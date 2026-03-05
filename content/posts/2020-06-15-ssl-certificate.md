---
title: "SSL сертификат с Certbot"
date: 2020-06-15
description: "Три команды для получения бесплатного SSL-сертификата через Certbot и nginx."
tags:
  - SSL
  - nginx
  - Linux
---
Для добавления сертификата на три месяца, выполнить команды:

```bash
sudo add-apt-repository ppa:certbot/certbot

sudo apt install python-certbot-nginx

sudo certbot --nginx -d DOMAIN_NAME
```
