$(function(){
    
    
    login_request = function(){
        
        console.log('gdffd');

       
        $.ajax({
            method: 'POST',
            url: 'http://193.218.136.174:8080/cabinet/rest/auth/login',
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
