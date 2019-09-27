function my_first_function(e){
	console.log(arguments);
	console.log(event.target);

}

var hideme = function(e){
	$(e.target).hide();
	
}


$(document).ready(function(){
	

	
});