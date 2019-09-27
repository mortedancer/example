var BASE 					= 100000;
var SYM_PER_DIGIT			=((BASE-1)+"").length;
var PADDING_MASK			="000000000000000000000";
var PADDING_VALUE			=PADDING_MASK.substring(0,SYM_PER_DIGIT);
var MAX_DIGIT_VALUE			=BASE-1;
var LONG_LEN				=12;

var RND_DIGIT = function(){return Math.floor(Math.random()*(MAX_DIGIT_VALUE-1)+1)};
var RND_ARRAY = function(num){return Array.apply(null, {length: num}).map(Function.call, RND_DIGIT)};
var ZRO_ARRAY = function(num){return Array.apply(null, {length: num}).map(Function.call, function(){return 0})};

String.prototype.paddingLeft 	=function(paddingValue){return String(paddingValue + this).slice(-paddingValue.length)};


function TBuffer(x)
		{	x=x||[];
			this.valData					= x.length>0 ? x.reduce(function(prev,cur){return prev+cur}):0; 
			this.base						=	BASE;
		};
		
TBuffer.prototype.rem 			=function()	{var r = this.valData % this.base; this.shr(); return r };
TBuffer.prototype.shr 			=function()	{this.valData = Math.floor(this.valData/this.base)};
TBuffer.prototype.isZero 		=function()	{if(this.valData==0){return true} else {return false}};
TBuffer.prototype.notEmpty 		=function()	{return !this.isZero()};
		
TBuffer.prototype.PushSum 		=function(x){
											if (x.length>1) {this.valData+=x.reduce(function(prev,cur){return prev+cur}) }
											else {this.valData+=x }
										};
								
TBuffer.prototype.PushProd 	=function(x){
											if (x.length>1){this.valData+=x.reduce(function(prev,cur){return prev*cur}) }
											else {this.valData+=x} 
										};

function TLNum(s)
		{	s = s||{};
			this._digits 			=s['digits']||ZRO_ARRAY(LONG_LEN);
			/*
			if(s['digits']==undefined){this._digits=ZRO_ARRAY(LONG_LEN)}
							else{this._digits=s['digits']}
			*/
			this.maxlen				=s['digits'] ? s['digits'].length:LONG_LEN;
			/*
			if(s['digits']!=undefined){this.maxlen=s['digits'].length}
						else{this.maxlen=LONG_LEN}
			*/
			this.negative			=s['n']||false;
			this.layout				=s['layout']||null;	
			this.how				=[];
			this.ref				=0;
			this._current			=0;
			this.lsd_num			=0;
			
			this.auto_len()
			return this;
		};
						


TLNum.prototype.first						=function()	{this._current=0; return this.currentVal()};
TLNum.prototype.last						=function()	{this._current=this.lsd_num; return this.currentVal()};
TLNum.prototype.next						=function()	{this._current+=1; return this.currentVal()};
TLNum.prototype.prev						=function()	{this._current-=1; return this.currentVal()};

//TLNum.prototype.current_is_last			=function() {return this._current == this.lsd_num};
TLNum.prototype.is_leading_zerro		=function() {return this._current > this.lsd_num};

TLNum.prototype.isFull 					=function() {return (this._current == this._digits.length )};

TLNum.prototype.auto_len 				=function() {this.lsd_num = this._digits.reduce(function(p,c,i){if(c!=0)  p=i; return p },0)};
										
TLNum.prototype.setRand					=function(dig_to_set){this._digits.fill(0); this.setDigits(RND_ARRAY(dig_to_set)); return this };			
	
TLNum.prototype.currentAdd 				=function(el_to_add) {this._digits[this._current]+=el_to_add};

TLNum.prototype.lsd						=function(new_num){if (new_num==undefined) {return this.lsd_num} else  this.lsd_num=new_num};
																			
TLNum.prototype.digits					=function(array_of_digit){if (array_of_digit==undefined) {return this._digits} else this.setDigits(array_of_digit)};	

TLNum.prototype.snapshoot				=function(){	this.layout.html(this.getLayout()); return this;}	


TLNum.prototype.str 					=function()	{
														return this._digits.slice(0,this.lsd_num+1)
																				.reduceRight(function(prev,cur){
																							return prev + cur.toString().paddingLeft(PADDING_VALUE)
																				})
												}
												
TLNum.prototype.getLayout		=function(){
										var l = '<span class="container">'+this.str()+'</span>'
									+'<span class="container">'+'['+this.digits().join(',')+']'+' lsd = '+this.lsd()+'</span>';
										return l;
									}	

TLNum.prototype.currentVal				=function(new_val){ 
													if (new_val==undefined) {return (this._digits[this._current] )} 
													else  {
																if(this._current==this.maxlen) 	{return false;}
																this._digits[this._current]=new_val; return true
													}
												};

TLNum.prototype.setDigits 				=function (digit_array) {
													this.first(); this._digits.fill(0);
													while (!this.isFull() && this._current<digit_array.length) {
														this.currentVal(digit_array[this._current]);
														this.next()
													}
													if (!this.isFull()) {this.prev();}
													this.lsd(this._current)
												}

TLNum.prototype.addShort 				=function (buffer_short) {	
													buffer_short.PushSum(this.first());
													while(buffer_short.notEmpty()){
														this.currentVal(	buffer_short.rem() );
														buffer_short.PushSum(this.next());
													}
													if(this._current>this.lsd()) {this.lsd(_current);}
													this.first();
												}

TLNum.prototype.add 						=function(LNum){
													this.ref= parseInt(this.str())+parseInt(LNum.str());
													var	buffer_short = new TBuffer([this.first(), LNum.first()]);
													while(!LNum.is_leading_zerro()||buffer_short.notEmpty()){
														if(this.currentVal( buffer_short.rem() )){
																buffer_short.PushSum([this.next(),	LNum.next()]);
														} else {console.log('ofl while doing add'); return false}
													}
													this.prev();  this.lsd(this.lsd()>this._current ? this.lsd():this._current); 
													this.first(); LNum.first();
													return this;
												}

TLNum.prototype.mul 						=function(LNum){
													var res = new TLNum(),
													buffer_short = new TBuffer([res.currentVal(),this.first()*LNum.first()]);
										 			
										 			this.ref= parseInt(this.str())*parseInt(LNum.str());
										 			
										 			while(!LNum.is_leading_zerro()){
														while(!this.is_leading_zerro()||buffer_short.notEmpty()){
															if(res.currentVal( buffer_short.rem() )){
																buffer_short.PushSum([res.next(), this.next()*LNum.currentVal()]);
															} else {console.log('ofl while doing mul'); return false}
														}
														LNum.next(); res._current=LNum._current;
														buffer_short.PushSum([res.currentVal(), this.first()*LNum.currentVal()]);
													}
													this.digits(res.digits());
													this.auto_len(); this.first(); LNum.first(); 
													return this;
												}

TLNum.prototype.sub						=function(LNum){
													if (this.lsd()<LNum.lsd()) {a=this.digits; this.digits(LNum.digits()); LNum.digits(a); this.negative=true;}
													var	buffer_short = new TBuffer([this.first(), BASE, -LNum.first()]);
													
													while(!LNum.is_leading_zerro()||buffer_short.notEmpty()){
														this.currentVal(buffer_short.rem());
														buffer_short.PushSum([-1, this.next() , BASE , -LNum.next()]);
													}
													this.last();
													while (this.currentVal()==0) this.prev();
													this.lsd(this._current); this.first(); LNum.first()
												}