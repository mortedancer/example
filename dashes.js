'use strict';
const dash_count=20;
//var strategy="random_choise";
var strategy="optimal";
var board={current_pos:dash_count};
var sides=["ai","human"]; 
var actions,NB;
var turn={drop_out_per_round:0,side:1};
var RING_MOD=5;

function isOdd(e){return e%2===1;}
function getRandomSelection(odd=true){
	let r=~~(Math.random()*3+1);
	if(odd){return isOdd(r)?r:Math.max(2,r-1)}
	else{return isOdd(r)?Math.max(1,r-1):r}
}

function dropBoardState(){
	board.current_pos=dash_count;
	board.layout_element.empty();
	let n=0;
	while(n<dash_count){
		let bar=`<button id="bar_btn_${n}" 
					class="bar" bar_num="${n}"
					style="display:inline-block"></button>`
		board.layout_element.append(bar);
		n++;}
	$('button.bar').on('click',request_drop)
	
}

function machine_do(){
		NB.prop("disabled",true);
		NB.html("AI is thinking...");
		switch(strategy){
			case "random_choise":drop_n_bars(do_random_selection());break;
			case "optimal":drop_n_bars(do_optimal_selection());break;
			default:break;
		}
		//console.log('Humans would be destroyed!!! OBEY!')

		
		function drop_n_bars(N){
			var timeout=1000;
			console.log(`${sides[turn.side]} going to remove ${N} bars`);
			remove_bar();
			function remove_bar(){
				setTimeout(()=>{
					if(turn.drop_out_per_round<N){
						let bar_index=dash_count-board.current_pos;
						if(board.current_pos===1){turn.drop_out_per_round++;remove_bar(); return}
						$(`button#bar_btn_${bar_index}`).click();	
						remove_bar()
					}
					else {
						NB.prop("disabled",false);
						NB.html("END TURN");
						console.log("END TURN");
						next_turn();
					}	
				},~~(Math.random()*timeout))
			} 
		}
		
		function do_random_selection(){
			return getRandomSelection(Math.random()>0.5);
		}
		function do_optimal_selection(){
			//return board.current_pos%5-1;//getRandomSelection(!isOdd(board.current_pos));
			return RING_MOD-board.current_pos%RING_MOD;
		}
		
}

function request_drop(e){
	let b=$(e.target);
	//console.log(e);
	let clicked_bar_number=parseInt(b.attr("bar_num"));
	if((dash_count-clicked_bar_number)==(board.current_pos)){bar_destroy();} 
	else {reject_brutal_play();return;}
	
	function bar_destroy(){
		b.addClass('drop-out').prop("disabled",true);
		board.current_pos--;
		turn.drop_out_per_round++;
		if(turn.drop_out_per_round===3 && turn.side===1){NB.click();}}
	function reject_brutal_play(){
			console.warn(`Hey it's not polietly!!! take barsone-by-one don't be so dump ho-ho-ho-ho humans are so funny)))`);
	}
}
function next_turn(){
		if(turn.drop_out_per_round===0){return}
		let prev_side=turn.side;
		let side=(prev_side+1)%sides.length;
		if(board.current_pos===1){
			console.error(sides[side]+' LOOSE!');
			dropBoardState();
			return;
		}
		//console.info(`${sides[prev_side].toUpperCase()} tur ends now time for ${sides[side].toUpperCase()}`)
		turn={drop_out_per_round:0,side:side};
		actions[turn.side]();
}
$(document).ready(()=>{
	board.layout_element = $("#board");
	NB=$("button#nextTurnButton");
	NB.on('click',next_turn);
	dropBoardState();
	actions=[machine_do,()=>{}]
});
 
 
 