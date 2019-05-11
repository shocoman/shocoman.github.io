$(function(){
    
    
    login_request = function(){
        
        console.log('gdffd');
       
        
        $.ajax({
            url: 'http://193.218.136.174:8080/cabinet/rest/auth/login',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'application/json',
            data: {
                'username': '',
                'password': '',
                'appToken': 'XO6dmVqroG'
            }
            
            
        }).done(function(html){
            console.log(html);
        })
        
        
        
        
    }
    
    
    $('#enter_button').click(login_request);
    
    
});
