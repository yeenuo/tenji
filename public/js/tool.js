var Tool = new Function();
Tool.prototype = {
    version : "1.0",
    date : function(str) {
		var a =  str.substring(0,4)+"-"+ str.substring(4,6)+"-" + str.substring(6,8);
		return new Date(Date.parse(a));
    },
	setHM : function(date,hm) {
		var h =  parseInt(hm.substring(0,2));
		var m =  parseInt(hm.substring(2,4));
		date.setHours(h);
		date.setMinutes(m);
    },
	day : function(str) {
		return  this.date(str).getDate(); 
    },
	week : function(str) {
		//0星期天
		return  this.date(str).getDay(); 
    },
	jweek: function(str) {
		//0星期天
		var strs = ["日","月","火","水","木","金","土"];
		return  strs[this.week(str)]; 
    },
	getListText:function(key,objs){
		for(var i = 0;i<objs.length;i++)
		{
			var obj = objs[i];
			if(obj.value == key)
			{
				return obj.text;
			}
		}
		return null;
	}
};