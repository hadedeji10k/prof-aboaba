$(function() {

    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }
        
    $('a.confirmDeletion').on('click' , function () {
        if(!confirm('Confirm Deletion?')) return false ;
    });

    if($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox()
    }



    
   // Paystack integration
   const paymentForm = document.getElementById('paymentForm');
   paymentForm.addEventListener("submit", payWithPaystack, false);
   function payWithPaystack(e) {
      e.preventDefault();
      let handler = PaystackPop.setup({
         key: 'pk_test_8fa902253fbe543ee108a6592435eb8ac9614f92',
         email: document.getElementById("email-address").value,
         amount: document.getElementById("amount").value * 100,
         ref: ''+Math.floor((Math.random() * 1000000000) + 1), 
         // label: "Optional string that replaces customer email"
         onClose: function(){
            alert('Payment canceled!');
         },
         callback: function(response){
            let message = 'Payment complete! Reference: ' + response.reference;
            alert(message);
         }
      });
      handler.openIframe();
   }


});
