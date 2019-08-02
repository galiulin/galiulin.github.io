Сегодня занимался присвоением доменного имени своему сайту. Как и многие вещи, сделать это довольно просто, только пришлось попрыгать между ресурсами, чтобы собрать всю информацию воедино.
И так, основные шаги:

1.  Зарегистрироваться на одном из регистраторов доменного имени. Я обращал внимание на следующие пункты:
      
       - цена на первый год и цена продления.
       - стоимость переноса
       - дополнительные бонусы.
   
    Много времени не тратя, остановился на [namecheap.com](https://www.namecheap.com/), выбрал из-за приблизительно средней ценой и бесплатным WhoisGuard Protection.
    
    На GoDaddy, в зоне .com, первый год обойдется в один рубль. Но второй будет дороговат, 1400 рублей (стоимость на текущий день).
    
2.  Выбираем имя, оплачиваем.
    
3.  Заходим в Domain List -> manage -> Advanced DNS. Тут удаляем все Host Records и добавляем свой, с типом "A Record", на месте Host прописываем @ (Этот знак означает подстановку корневого домена), value указываем ip address. Всё. По умолчанию, он будет ссылаться на порт 80. 

    Первоначально я хотел сослаться сразу на порт 8080, для этого нужно создать Host Record с типом URL Redirect Record и в качестве Host прописать примерно следующее http://1.2.3.4:8080/ и выбрать, маскировать ip или нет. [Подробнее на этой странице.](https://www.namecheap.com/support/knowledgebase/article.aspx/9678/2237/how-to-redirect-subdomain-to-a-certain-ip-address-along-with-a-port) 
   
    При маскировке, по идее, должно прописываться доменное имя, а при отутствии, вместо имени отображается ip адрес.
    Так вот, с маскировкой сайт не захотел открываться. 
   
4.  Теперь, нужно чтобы с порта 80 переадресовывало на порт 8080. У меня сервер на ubuntu, установил nginx.

        $ sudo apt update
        $ sudo apt install nginx
        $ sudo ufw allow 'Nginx HTTP'
        
    проверяем статус запуска nginx
    
        $ systemctl status nginx
        
    конфигуриуем nginx
    
        $ vim /etc/nginx/sites-enabled/mysite.name
        
    туда вбиваем следующее содержимое 
    
        server {
            listen 80;
            server_name your-domain-name.com;
            location / {
                proxy_set_header   X-Real-IP $remote_addr;
                proxy_set_header   Host      $http_host;
                proxy_pass         http://127.0.0.1:8080;
            }
        }
        
    Желательно удалить примеры файлов конфигурации
    
        rm /etc/nginx/sites-available/default
        rm /etc/nginx/sites-enabled/default
        rm /etc/nginx/conf.d/default
        
    источники [раз](https://www.digitalocean.com/community/tutorials/nginx-ubuntu-18-04-ru), [два](https://www.ghostforbeginners.com/how-to-proxy-port-80-to-2368-for-ghost-with-nginx/).
