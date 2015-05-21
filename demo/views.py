from django.shortcuts import render, render_to_response, redirect
from django.http import HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from forms import CreateInvoiceForm
import requests
import json
import hmac
import time
import base64
import hashlib
import os
import yellow
from decimal import Decimal

def create(request):
    api_key = os.environ["API_KEY"]
    api_secret = os.environ["API_SECRET"]
    data = yellow.create_invoice(api_key,
                                 api_secret,
                                 base_ccy="USD",
                                 base_price="0.10")
    
    id = data['id']
    address = data['address']
    remaining = data['remaining']
    base_price = data['base_price']
    base_ccy = data['base_ccy']
    status = data['status']
    
    context = { "id": id,
                "address": address,
                "remaining": remaining,
                "base_price": base_price,
                "base_ccy": base_ccy,
                "status": status,
               }
    return render(request, 'demo/invoice.html', context)


