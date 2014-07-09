
$(document).ready(function(){
    var new_item = "\
        <div class='item-row'>\
            <input class='item' type='text' name='item1' title='Enter an item'></input>\
            <div class='claim-box unclaimed'>Claim</div>\
        </div>"
    var removal_handler = function(){
        if (
            $(".item:last").is(this)
            ){
            console.log('Last item gets to stay');
        }else if (this.value !== this.defaultValue) {
            console.log('Entered text gets to stay.');
        }else {
            console.log('Default entered text in non-last item DIES');
            $(this).closest('.item-row').remove();
        }
    };
    var add_new_item = function(){
        if ($(".item:last").is(this)){
            $("#items").append(new_item);
            $(".item:last")
              .keydown(add_new_item)
              .blur(removal_handler);
            $(".claim-box:last").click(claim_item);
        }
    }

    var claim_item = function(){
        console.log('Clicked!');
        if ($(this).hasClass('unclaimed')){
            console.log('Unclaimed!');
            $(this).removeClass('unclaimed').addClass('claimed current-user-color').text('Me');
        }
    }

    $(".item").keydown(add_new_item).blur(removal_handler);
    $(".claim-box").click(claim_item)
});