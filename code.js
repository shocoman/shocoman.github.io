$(function(){
    
    
    login_request = function(){
        
        console.log('gdffd');

         
        $.ajax({
            method: 'POST',
            url: '//dec.sfu-kras.ru/cabinet/rest/auth/login',
            contentType: 'application/json',
            data: {
                'username': 'dasda',
                'password': 'asdasda',
                'appToken': 'XO6dmVqroG'
            },
            success: function(){
                console.log(this.responseText);
            }
        }).done(function(html){
            console.log(html)
        });
        
        
        
        
    }
    
    
    $('#enter_button').click(login_request);
    
    
});
