


aes_encrypt = function(msg, k){
    //let nonce = CryptoJS.enc.Base64.parse('ThS5WCm5hedKU8y4ygaIgg==');
    let nonce = CryptoJS.lib.WordArray.random(16);
    
    let key = CryptoJS.enc.Base64.parse(k);

    let encrypted = CryptoJS.AES.encrypt(msg, key, {
      mode: CryptoJS.mode.CTR,
      iv: nonce,
      padding: CryptoJS.pad.NoPadding
    });
    
    let zzz = CryptoJS.enc.Base64.stringify(nonce) + encrypted.toString();
    
    console.log('EMSG: ', zzz);

    return zzz;
}

aes_decrypt = function(raw_msg, k){
    let nonce = CryptoJS.enc.Base64.parse(raw_msg.substring(0, 24));
    let key = CryptoJS.enc.Base64.parse(k);

    let decrypted = CryptoJS.AES.decrypt(raw_msg.substring(24), key, {
      mode: CryptoJS.mode.CTR,
      iv: nonce,
      padding: CryptoJS.pad.NoPadding
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}

sha256 = function(msg){
    return CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(msg))
}

pow_mod = function(b, p, m){
  let result = bigInt(1);
  let base = bigInt(b);
  let power = bigInt(p);
  let modulo = bigInt(m);

  base = base.mod(modulo);


  while (power.gt(bigInt(0))) {
    if (power.mod(2).eq(1))
      result = result.multiply(base).mod(modulo);
    power = power.shiftRight(1);

    base = base.multiply(base).mod(modulo);


  }

  return result.toString();
}

get_random = function(digits){
    digits -= 1;
    return bigInt.randBetween('1e'+digits, '1e'+(digits+1)).toString();
}



$(function(){
    
    let key = 'BIZ5jCeCEtSqN3J+Esbl1q6wkpJaG8oqB0Z8dtPnH4Y=';
    
    
    $('[name="forlogin"]').val('');
    $('[name="forpass"]').val('');
        
    
    login = function(){
        
        generate_key();
        console.log("Key generated");
       
        
        let data = {name: $('[name="forlogin"]').val(),
                pass: $('[name="forpass"]').val()};

        $.ajax({
            method: "POST",
            async: false,
            url: "myapp",
            data: prep_json('login', JSON.stringify(data))
        }).done(function(ans){
            
            ans = aes_decrypt(ans,key)
            
            
            if (ans === 'EE'){
                console.log('Wrong login or password!');
                
                if (data['name'].length > 0 || data['pass'].length > 0)
                    alert('Login or password are wrong!');
                
                $('#user_block').empty();
            } else if (ans === 'OO'){
                login();
            } else {
                console.log(ans);
                ans = JSON.parse(ans);
                
                show_topics();
                $('#main_block').css('display','');
                $('#login_block').css('display','none');
                
                $('#user_block').empty().append(`Name: ${ans['name']}<br> Access level: ${ans['access_level']}`);   
            }
        })
    };
    
    
    $('#login').click(login);
    
    $('#register').click(function(){
        generate_key();
        
        if ($('[name="forlogin"]').val() == '' || $('[name="forpass"]').val() == ''){
            alert('Name and password fields cannot be empty!');
            return;
        }
        
        $.post('myapp', prep_json('register', JSON.stringify({name: $('[name="forlogin"]').val(),
                                                pass: $('[name="forpass"').val(), access_level: $('#foraccess').val()}))).done(function(ans){
            alert(aes_decrypt(ans,key))
        })
        
        
        
    })
    
    generate_key = function(){
        
        jQuery.ajax({
            method: "POST",
            async: false,
            url: "myapp",
            data: {'head': 'KEY1'}
        }).done(function( html ){
            
            console.log('KEY1 DONE');
            
            let p = -1;
            let g = -1;
            let b = get_random(40);
            let A = -1;
            
            let resp = JSON.parse(html);
            p = resp['p'];
            g = resp['g'];
            A = resp['A'];
            
            let BB = pow_mod(g, b, p);
            
            key = sha256(pow_mod(A, b, p));
            
            
            jQuery.ajax({
                method: "POST",
                url: "myapp",
                async: false,
                data: {'head': 'KEY2',B: BB}
            }).done(function(){
                console.log('KEY2 DONE', key);
            })
                    
        })
        
    }
    
    
    send_smth = function(what, smth, id){
        
        jQuery('#' + id).load(url = 'myapp',
                data = {'head': what, 'msg': aes_encrypt(smth, key)});
        
    }
    
    prep_json = function(head, body = ''){
        generate_key();
        return {'head': head, 'msg': aes_encrypt(body, key)};
    }
    
    
    show_topics = function(){

        $.post('myapp', prep_json('show_topics'), function(ans){

            $('#topics_block').empty();
            ans = JSON.parse(aes_decrypt(ans,key))
            for (let i = 0; i < ans.length; i++) {
                let author = ans[i]['author']
                let topic_name = ans[i]['name']
                
                $('#topics_block').append(`<div> <hr><br> ${i+1}) Author: ${author} 
                                            <br>Name: ${topic_name} 
                                            <br>Text: ${ans[i]['text']} 
                                            <br>Access level: ${ans[i]['access_level']} 
                                            <br><button num="${i+1}">Remove message</button> </div>`);
                
                $('[num="' + (i+1) + '"]').click(function(){
                    
                    $.post('myapp', prep_json('remove_topic', JSON.stringify({username: author,
                                                    topictext: topic_name, access_level: ans[i]['access_level']}))).done(function(ans){

                        alert(aes_decrypt(ans,key));
                        show_topics();
                    })
                    
                })
            }

        })
    
    }

    
    
    
    
    
    add_topic = function(){

            $.post('myapp', prep_json('add_topic', JSON.stringify({name: $('#topic_name').val(),
                                                text: $('#topic_text').val()}))).done(function(ans){
                //console.log(aes_decrypt(ans,key));
                alert(aes_decrypt(ans,key));
                show_topics();
            })
        
    };
    

    
    $('[value="Add"]').click(add_topic);
    
    
    $('[value="Logout"]').click(function(){
        
            $.post('myapp', prep_json('logout')).done(function(ans){
                
                if (ans == 'OK'){
                    $('#main_block').css('display','none');
                    $('#login_block').css('display','');
                }
                
                location.reload();
                  
            })
    });
    
    
    
    delete_topic = function(user_name, topic_name){
        console.log(user_name, topic_name);
        
    }
    
    
    
    login();
    
});