White Label Demo
================

This project provides a sample implementation of a Yellow payment widget.

This sample is intended to be a barebones implementation - there's no styling and we've made sacrifices in performance/functionality/code-style in order to present as minimal an implementation as possible. Hopefully it illustrates the core elements of building a white label solution, and provides a base off which you can build your own more sophisticated version.

Although the sample is written in python/Django it is largely language/framework agnostic. The most relevant parts are in HTML and javascript. In particular these 3 files:
* [views.py](https://github.com/YellowPay/yellowdemo-whitelabel/blob/master/demo/views.py)
* [invoice.html](https://github.com/YellowPay/yellowdemo-whitelabel/blob/master/demo/templates/demo/invoice.html)
* [invoice.js](https://github.com/YellowPay/yellowdemo-whitelabel/blob/master/demo/static/demo/js/invoice.js)

For more information on styling your own payment widget, check out our api docs: http://yellowpay.co/docs/api
