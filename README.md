White Label Demo
================

This project provides a sample implementation of a Yellow payment widget.

This sample is intended to be a barebones implementation - there's no styling and we've made sacrifices in performance/functionality/code-style in order to present as minimal an implementation as possible. Hopefully it illustrates the core elements of building a white label solution, and provides a base off which you can build your own more sophisticated version.

Although the sample is written in python/Django it is largely language/framework agnostic. The most relevant parts are in HTML and javascript. In particular these 3 files:
* [views.py](https://github.com/YellowPay/yellowdemo-whitelabel/blob/master/demo/views.py)
* [invoice.html](https://github.com/YellowPay/yellowdemo-whitelabel/blob/master/demo/templates/demo/invoice.html)
* [invoice.js](https://github.com/YellowPay/yellowdemo-whitelabel/blob/master/demo/static/demo/js/invoice.js)

For more information on styling your own payment widget, check out our api docs: http://yellowpay.co/docs/api

Setup Instructions
==================

* Create a python virtual environment and activate it
* Install [ngrok](https://ngrok.com) and run it, point it at local port 8080. Make note of the URL ngrok gives you.
* Within the root directory of yellowdemo-whitelabel, type:
```
pip install -r requirements.txt
```
* Set the following environment variables:
  * SECRET_KEY # A random string of characters
  * DJANGO_PROJECT='yellowdemo-whitelabel'
  * API_KEY # Your merchant account API key
  * API_SECRET # Your mercant account API secret
* Run the server!
```
python manage.py runserver 127.0.0.1:8080
```
