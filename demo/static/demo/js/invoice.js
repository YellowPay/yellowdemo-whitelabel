/*
 * NOTE: this file is intended for illustration purposes - coding conventions,
 *       performance, and functionality were all compromised in the interest
 *       of presenting as minimal an implementation as possible. When a
 *       white-label solution is deployed in production we'd expect that this
 *       file may be heavily edited or replaced outright.
 * 
 *       The html updated by this file can be found in
 *       yellowdemo-whitelabel/demo/templates/demp/invoice.html
 */

var counter;
var status = "";
var received = "";
var remaining = "";
var timeRemaining = 600;

// Timer needed for these statuses
var timerStatus = ["loading", "new", "partial"];

// Invoice status ping needed for these statuses
var pingStatus = ["error", "loading", "new", "partial", "authorizing"]; 

//----------------------------------------------------------------------------
// Helper functions
//----------------------------------------------------------------------------

// Pad a number with 0's
function pad(num, size) {
  var s = "000000000" + num;
  return s.substr(s.length-size);
}

// Select all the text in an element
function selectText(elt) {
  var doc = document; 
  var text = doc.getElementById(elt); 
  var range;
  var selection;

  if (doc.body.createTextRange) {
    range = document.body.createTextRange();
    range.moveToElementText(text);
    range.select();
  } else if (window.getSelection) {
    selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(text);
    if(selection != range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

function eltToSelect(e, elt){
  e.preventDefault();
  selectText(elt);
  e.target.focus();
}

//----------------------------------------------------------------------------
// Timer functions
// These functions control the timer that is used to notify the customer when
// the invoice will expire (each invoice is valid for 10 minutes)
//----------------------------------------------------------------------------
function updateTimer(seconds) {
  minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  $("#yellow-timer").text(minutes + ":" + pad(seconds, 2));
}

function timer()
{
  timeRemaining=timeRemaining-1;
  if (timeRemaining < 0)
  {
   clearInterval(counter);
   return;
  }
  updateTimer(timeRemaining);
}

//----------------------------------------------------------------------------
// Status functions
// These functions handle querying the Yellow server for status changes, and
// updating the widget display accordingly.
//----------------------------------------------------------------------------
function statusChange(data) {

  // Sync timeRemaining if we've gotten out of sync
  if (Math.abs(data['time_remaining'] - timeRemaining) > 5) {
    timeRemaining = data['time_remaining'];
  }

  // Current invoice status. You'll probably want to update the widget for
  // the following statuses:
  // * loading:          Status used before an invoice is ready to receive 
  //                     payment - the bitcoin address should not be displayed
  //                     until the invoice changes to the 'new' status to
  //                     avoid missing a payment
  //
  // * new:              Invoice is ready to receive payments
  //
  // * partial:          Invoice has received a partial payment -
  //                     data['received'] will contain the payment received
  //                     and data['remaining'] the amount still owed
  //
  // * authorizing:      Complete payment has been detected and we're just
  //                     waiting for it to confirm on the blockchain -
  //                     typically at this point the customer would be
  //                     redirected to a Success/Confirmation page to preserve
  //                     the checkout experience, but the merchant wouldn't
  //                     ship their poduct until the payment was confirmed
  //                     (typically communicated server-to-server via IPN)
  //
  // * confirmed:        Payment has been confirmed on the blockchain -
  //                     typically the frontend widget will not need to handle
  //                     this status as the customer will have been redirected
  //                     to a Success/Confirmation page at the 'authorizing'
  //                     status
  // 
  // * expired:          Invoice has expired - the bitcoin address / QR code
  //                     should be hidden (to avoid belated payments) and the
  //                     customer should be informed of how to place their
  //                     their order again
  // 
  // * refund_owed:      Incorrect payment was received - this can happen if
  //                     too large a payment was received or if the invoice
  //                     expires with a partial paymen. An HTML form should
  //                     be displayed to allow the customer to request a full
  //                     refund. Refunds issued for incorrect payments can
  //                     be handled entirely in Bitcoin by Yellow with
  //                     minimal merchant involvment.
  //
  // * refund_requested: Customer has submitted refund information.
  //
  // * refund_paid:      Yellow has issued a refund to the customer -
  //                     typically you will not need to display this status
  //                     as the customer can be redirected back to the store
  //                     as soon as they've submitted their refund information
  status = data['status'];
  received = data['received'];
  
  // Update the widget to reflect the remaining amount owed on the invoice.
  // It's particularly import to update the bitcoin URI and the QR code
  // as the amount encoded will be used by the customer's bitcoin wallet to
  // determine the amount of payment needed.
  if (remaining != data['remaining']) {
    remaining = data['remaining'];
    $("#yellow-amount").text(data['remaining']);
    // Note: address is set in invoice.html
    var uri = "bitcoin:" + address + "?amount=" + data['remaining'];
    var qr = "//chart.googleapis.com/chart?cht=qr&chl=" + uri + "&chs=150x150&chld=L|1";
    $("#yellow-qr").html("<img src=\"" + qr + "\"></img>");
    $("#yellow-uri").html("<a href=\"" + uri + "\">" + uri + "</a>");
  }
  
  // Toggle the widget between 
  // 1. Refund handling
  // 2. Expired message
  // 3. Ready to receive payment
  if (status == "refund_owed" ||
      status == "refund_requested" || 
      status == "refund_paid") {
    console.log(status);
    $("#yellow-widget").hide();
    $("#yellow-refund").show();
  } else if (status == "expired") {
    $("#yellow-widget").hide();
    $("#yellow-expired").show();
  } else if (status != "loading") {
    // Only show the widget / bitcoin address once the invoice has finished
    // loading
    $("#yellow-widget").show();
  }
  
  // Stop the timer if needed
  if (-1 == $.inArray(status, timerStatus)) {
    clearInterval(counter);
  }
  
  $("#yellow-status").text(status);
  
  // Ping
  if ($.inArray(status, pingStatus) > -1) {
    setTimeout(pingInvoice, 1000);
  }
}


function pingInvoice() {
  // Regularly pings the Yellow API server for any invoice status/payment
  // updates
  // 
  // Currently the Yellow payment widget is updated via polling. We're
  // planning to port it to a push-based architecture and will update
  // this demo when we do - but for now you'll have to ping the invoice
  // status regularly (this file polls every second)
  // 
  // Note: invoiceId is set in invoice.html
  var url = "https://api.yellowpay.co/client/invoice/" + invoiceId + "/" ;
  var options = {
     url : url,
     method : 'GET',
     dataType : "json",
     error : function(xhr, status, error) {
       console.log("ERROR querying " + url + " (" + status + " " + error + "): " + xhr.responseText);
       setTimeout(pingInvoice, 1000);
     },
     success : statusChange,
     contentType: "application/json"
  };
   
  // CORS support for older versions of IE
  if (!$.support.cors && window.XDomainRequest) {
     // Force crossDomain so older versions of IE use jquery.XDomainRequest.js
     options['crossDomain'] = true;
  }
   
  $.ajax(options);
}


$(document).ready(function () {
  // Allow 1-click select of the bitcoin address and payment amount to make
  // it easier for a user to cut/paste the values if they don't wich to use
  // the QR code or bitcoin URI
  $('#yellow-widget').on('focus mousedown', '#yellow-amount', function(e){
    eltToSelect(e, 'yellow-amount');
  });

  $('#yellow-widget').on('focus mousedown', '#yellow-address', function(e){
    eltToSelect(e, 'yellow-address');
  });

  pingInvoice();
  counter = setInterval(timer, 1000);
});

