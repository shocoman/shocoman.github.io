$(function(){
    
    
    
    add_text = function(){
        
        $('[name="server_response"]').load('/cgi-bin/main_page.py',
                                           $('#add_text_form').serializeArray());
        
    }
    
    $('[value="Show all"]').click(function(){
        
        
    
        $('[name="topic_list"]').load('/cgi-bin/show_topics.py');
        
        console.log($('[name="topic_list"]'));
        
    })
    
});