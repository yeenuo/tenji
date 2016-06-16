//<debug>
Ext.Loader.setPath({
    'Ext': '../../src'
});
//</debug>

/**
 * This simple example shows the ability of the Ext.List component.
 *
 * In this example, it uses a grouped store to show group headers in the list. It also
 * includes an indicator so you can quickly swipe through each of the groups. On top of that
 * it has a disclosure button so you can disclose more information for a list item.
 */

//define the application
var app = Ext.application({
    isIconPrecomposed: false,
    //require any components/classes what we will use in our example
    requires: [
        'Ext.MessageBox',
		 'OpenCharts.OpenCharts',
        'Ext.data.Store'
    ],

    /**
     * The launch method is called when the browser is ready, and the application can launch.
     *
     * Inside our launch method we create the list and show in in the viewport. We get the lists configuration
     * using the getListConfiguration method which we defined below.
     *
     * If the user is not on a phone, we wrap the list inside a panel which is centered on the page.
     */

	 initConfig:function()
	{
		var me = this;
		me.alltime = 0;//合计时间
		me.actualtime = 0;//合计时间
		me.spot = -1
		me.user = -1;
		me.data = {};//当前选中data,便于删除修改添加用
		me.datas = [];
		me.admindatas =[];//合计数据
		me.index = 0;//当前数据序号，实际用日期也可取。
		me.month = Ext.Date.format(new Date(),"Ym");//当前月份
		me.config = {};
		me.tomail = "";//需要发送mail的人，作业时间不足。
	},
    launch: function() {
    	var me = this;
		this.tool = new Tool();
		me.initConfig();
		me.status ={
			f:'yellow',//future未来
			d:'green',//done 已完成
			u:'red',//undo 未做
			n:'gray'//NoNeed 不需要
		};

		me.rest_data = [
						{text: '--',  value: '0'},
                        {text: '全休',  value: '1'},
                        {text: '午前休', value: '2'},
						{text: '午後休', value: '3'},
						{text: '遅刻', value: '4'},
						{text: '早退', value: '5'},
						{text: 'その他', value: '6'}
                    ];
		me.reason_data = [
						{text: '--',  value: '0'},
                        {text: '私用',  value: '1'},
                        {text: '体調不良', value: '2'},
						{text: '帰社', value: '3'},
						{text: '帰国', value: '4'},
						{text: '看病', value: '5'},
						{text: 'その他', value: '6'}
                    ];
    	me.panel_list = me.getList();//列表
		me.panel_input = me.getInput();//录入
		me.panel_config = me.getConfig();//设定
		me.panel_admin = me.getAdmin();
    	me.mainPanel = Ext.create('Ext.TabPanel', {
    	    fullscreen: true,
    	    tabBarPosition: 'bottom',
    	    id:'panel_main',
			showAnimation:{  
                   type : 'cube'  
               },  
               layout: {  
                   type: 'card',  
                   animation: {  
                       type : 'cube'  
                   }  
               },
    	    defaults: {
    	        styleHtmlContent: true
    	    },
			activeItem:3,
    	    items: [
				me.panel_list,
				me.panel_input,
				me.panel_config,
				me.getLogin(),
				me.panel_admin
    	    ]
    	});
		//Ext.getCmp('panel_main').setActiveItem(3);//初次启动，登录页面

		me.mainPanel.on("activeitemchange",function(tb, value, oldValue, eOpts){
			if(me.user == -1)
			{
					Ext.getCmp('panel_main').setActiveItem(3);//初次启动，登录页面
			}
			else if(value.id=="tab_input"){
				if(!me.data.date)
				{		
					
						Ext.getCmp('panel_main').setActiveItem(0);//当入力数据为空时，List页面
				}
			}
		});
    },
	//管理员
	getAdmin:function()
	{
		var me=this;
    	var listAdmin =  me.getAdminConfiguration();
    	return {
            title: '管理者',
            iconCls: 'star',
			id : 'tab_admin',
			layout : 'card',
			hidden:true,
			items: [listAdmin]
    	};
	},
	//保存配置数据
	saveConfigData:function()
	{
		var me = this;
		var data = {};
		if(me.spot<0)
		{
			data.option = "sti";//添加
		}
		else
		{
			data.id = me.spot;
			data.option = "stu";//更新
		}
		
		fields = ["cstarttime","cendtime","stime1","etime1","stime2","etime2","stime3","etime3","stime4","etime4","stime5","etime5"];
		for(var i=0;i<fields.length;i++)
		{
			var sDate =  new Date(Ext.getCmp(fields[i]).getValue());
			data[fields[i]] =  Ext.Date.format(sDate,"Hi");
		}
		//先保存现场
		//属性赋值
		data["starttime"] = data["cstarttime"];
		delete data.cstarttime;
		data["endtime"] = data["cendtime"];
		delete data.cendtime;
		me.config = data;//初次设置各种时间
		Ext.Ajax.request({
			url: '../../config',
			method :'POST',
			params: data,
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(me.spot<0)//添加作业地点
				{
					me.spot = obj.id;//取得ID
				}
				me.saveWKTime();//更新作业时间
			},
		failure: function(response, opts) {
		  console.log('server erro:'+ response.status);
		}
		});



	},
	//保存工作时间
	saveWKTime:function()
	{
		var me = this;
		var data = {};
		//data.spot = me.spot;
		if(me.wktime)
		{
			data.id = me.wktime;
			data.option = "wku";//更新
		}
		else
		{
			data.option = "wki";//添加
		}
		
		var fields = ["mintime","maxtime"];
		for(var i=0;i<fields.length;i++)
		{
			data[fields[i]] = Ext.getCmp(fields[i]).getValue();
			me.config[fields[i]] = data[fields[i]];
		}
		fields = ["r0","r1","r2","r3","r4","r5","r6"];
		for(var i=0;i<fields.length;i++)
		{
			data[fields[i]] = 0;
			if(Ext.getCmp(fields[i]).isChecked())
			{
				data[fields[i]] = 1;
			}
			me.config[fields[i]] = data[fields[i]];
		}
		data.user = me.user;
		data.spot = me.spot;

		Ext.Ajax.request({
			url: '../../config',
			method :'POST',
			params: data,
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				var data = obj;
				me.wktime = obj.id;//取得ID
				me.store.load({
					params ://刷新LIST主页面
					{
						'user':me.user, 
						'month':me.month
					}
				});
				alert(	"保存完了。");
			},
		failure: function(response, opts) {
		  console.log('server erro:'+ response.status);
		}
		});
	},
	//向合计时间内保存数据
	saveAllTime:function(func)
	{
		var me = this;
		var data = {user:me.user,month:me.month,actualtime:me.actualtime,alltime:me.alltime};//合计时间
			Ext.Ajax.request({
			url: '../../atime',
			method :'POST',
			params: data,
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(obj.success)
				{

				}
				if(func)
				{
					func(obj);
				}
			},
			failure: function(response, opts) {
			  console.log('server erro:'+ response.status);
			}
		});
	},
	//从DB获取设定数据，画面设置数据，登录时调用
	loadConfigData:function(func)
	{
		var me = this;
		var data = {user:me.user,month:me.month,option:"q"};
		Ext.Ajax.request({
			url: '../../config',
			method :'POST',
			params: data,
			success: function(response, opts) {
			var obj = Ext.decode(response.responseText);
			if(obj.success)
			{
				var data = obj;
				//设置me.config数据
				me.spot = data.spot;
				me.wktime = data.wktime;
				me.config= data;
				me.config.starttime= data.cstarttime;//修正
				me.config.endtime= data.cendtime;

				if(me.datas.length>0)//已读取数据
				{
					me.calAllTime();//计算总计时间，两处都执行
					me.setAllTime();//设置合计时间
					me.saveAllTime();
				}
				var fields = ["mintime","maxtime"];
				for(var i=0;i<fields.length;i++)
				{
					Ext.getCmp(fields[i]).setValue(data[fields[i]]);
				}

				fields = ["r0","r1","r2","r3","r4","r5","r6"];
				for(var i=0;i<fields.length;i++)
				{
					if(data[fields[i]] == 1)
					{
						Ext.getCmp(fields[i]).check();
					}
					else
					{
						Ext.getCmp(fields[i]).uncheck();
					}	
				}

				fields = ["cstarttime","cendtime","stime1","etime1","stime2","etime2","stime3","etime3","stime4","etime4","stime5","etime5"];
				for(var i=0;i<fields.length;i++)
				{
					var myDate = new Date(); 
					me.tool.setHM(myDate,data[fields[i]]);
					Ext.getCmp(fields[i]).setValue(myDate);
				}
			}
			if(func)
			{
				func(obj);
			}
		},
		failure: function(response, opts) {
		  console.log('server erro:'+ response.status);
		}
		});
	},
	getLogin:function()
	{
		var me=this;
		return {
            title: '登録',
            iconCls: 'user',
			id : 'tab_login',
			layout : 'vbox',
			items: [
						{
							xtype: 'textfield',
							id:'name',
							name : 'name',
							label: 'ユーザ',
							value:'tj1'
						},
						{
							xtype: 'passwordfield',
							id:'password',
							name : 'password',
							label: '暗証番号',
							value:'111111'
						},	
				{
					xtype : 'button',	
					text : '登録',
					handler:function()
					{
							me.initConfig();//初始化配置
							var name= Ext.getCmp("name").getValue();
							var password= Ext.getCmp("password").getValue();
							
							if((name=="")||(password==""))
							{
								alert("用户名或密码不得为空。");
								return;
							}
							var data = {"name":name,"password":password};
							Ext.Ajax.request({
								url: '../../login',
								method :'POST',
								params: data,
								success: function(response, opts) {
								  var obj = Ext.decode(response.responseText);
								 if(obj.success){//登陆成功
									me.user = obj.user;
									me.role = obj.role;
									if(me.role == 1)
									 {
										Ext.getCmp("panel_main").getTabBar().items.items[4].show();
										me.adminstore.load();
									 }
									 else
									 {
										 Ext.getCmp("panel_main").getTabBar().items.items[4].hide();
									 }
									 Ext.getCmp("lbl_user_name").setHtml(data.name);
									 Ext.getCmp("month").setValue(new Date());
									me.loadConfigData(//读取配置数据
										function(rtn)
										 {
											if(rtn.success)
											 {
												me.store.load({params :
												{
													'user':me.user, 
													'month':me.month}
												});
												if(me.role == 1)
												 {
													Ext.getCmp('panel_main').setActiveItem(4);
												 }
												 else
												 {
													 Ext.getCmp('panel_main').setActiveItem(0);
												 }
												
											 }
											 else
											 {
													alert("まず各設定を入力してください。");
													Ext.getCmp('panel_main').setActiveItem(2);
											 }
										 }
									);

								}
								else
								{
										alert("用户名或密码错误。");
								}
				  console.dir(obj);
				},
				failure: function(response, opts) {
				  console.log('server erro:'+ response.status);
				}
				});
				}
				},
				{
					xtype : 'button',	
					text : '暗証番号リセット',
					handler:function()
					{
							var name= Ext.getCmp("name").getValue();
							if(name.length==0)
							{
								alert('名前を入力してください。');
								return;
							}
							 Ext.Msg.prompt('EMAIL', 'EMAILを入力してください。', function(id,text) {
								 text = "javaandnet@gmail.com";//Todo
								if(text.length>0)
								 {
												me.resetPWD(text);
								 }
													　
							});
					}
				}
			]
    	};
	},
    getList:function(){
    	var me=this;
    	var listConfiguration =  me.getListConfiguration();
    	return {
            title: '一覧',
            iconCls: 'calendar',
			id : 'tab_list',
			layout : 'card',
			items: [listConfiguration]
    	};
    },
	getComboText:function(key,objs){
		for(var i = 0;i<objs.length;i++)
		{
			var obj = objs[i];
			if(obj.value == key)
			{
				return obj.text;
			}
		}
		return null;
	},
	getConfig:function(){
		var me = this;
		return {
         title: '設定',
         iconCls: 'settings',
		scrollable:true,
		 items: [
				{
					xtype: 'fieldset',
					title: '作業日',
					items: [
						{
							xtype: 'checkboxfield',
								id:'r0',
							name : 'r0',
							label: '日'
						},
						{
							xtype: 'checkboxfield',
								id:'r1',
							name : 'r1',
							label: '月',
							checked: true
						},
						{
							xtype: 'checkboxfield',
								id:'r2',
							name : 'r2',
							label: '火',
							checked: true
						},
						{
							xtype: 'checkboxfield',
								id:'r3',
							name : 'r3',
							label: '水',
							checked: true
						},
						{
							xtype: 'checkboxfield',
								id:'r4',
							name : 'r4',
							label: '木',
							checked: true
						},
						{
							xtype: 'checkboxfield',
								id:'r5',
							name : 'r5',
							label: '金',
							checked: true
						},
						{
							xtype: 'checkboxfield',
								id:'r6',
							name : 'r6',
							label: '土' 
						}
					]
				},{
					xtype: 'fieldset',
					title: '作業制限',
					items: [
						{
							xtype: 'numberfield',
							id:'mintime',
							name : 'mintime',
							label: '最低時間',
							value:'140'
						},
						{
							xtype: 'numberfield',
							id:'maxtime',
							name : 'maxtime',
							label: '最高時間',
							value:'180'
						},						{
							xtype: 'timepickerfield',
							name : 'cstarttime',
							id:'cstarttime',
							editable　:true,
							label: '開始時間',
							value:'9:00'
						},
						{
							xtype: 'timepickerfield',
							name : 'cendtime',
								id:'cendtime',
							label: '終了時間',
							value:'18:00'
						}
					]
				},{
					xtype: 'fieldset',
					title: '休憩時間',
					items: [
						{
							xtype: 'timepickerfield',
							id:'stime1',
							name : 'stime1',
							label: '開始時間1',
							value: '12:00'　
						},
						{
							xtype: 'timepickerfield',
							id : 'etime1',
							name : 'etime1',
							label: '終了時間1',
							value: '13:00'　　
						},
								{
							xtype: 'timepickerfield',
							id:'stime2',
							name : 'stime2',
							label: '開始時間2',
							value: '00:00'　
						},
						{
							xtype: 'timepickerfield',
							id : 'etime2',
							name : 'etime2',
							label: '終了時間2',
							value: '00:00'　
						},
								{
							xtype: 'timepickerfield',
							id:'stime3',
							name : 'stime3',
							label: '開始時間3',
							value: '00:00'
						},
						{
							xtype: 'timepickerfield',
							id : 'etime3',
							name : 'etime3',
							label: '終了時間3',
							value: '00:00'　　
						},
						{
							xtype: 'timepickerfield',
							id:'stime4',
							name : 'stime4',
							label: '開始時間4',
							value: '00:00'　
						},
						{
							xtype: 'timepickerfield',
							id : 'etime4',
							name : 'etime4',
							label: '終了時間4',
							value: '00:00'　　
						},
								{
							xtype: 'timepickerfield',
							id:'stime5',
							name : 'stime5',
							label: '開始時間5',
							value: '00:00'　
						},
						{
							xtype: 'timepickerfield',
							id : 'etime5',
							name : 'etime5',
							label: '終了時間5',
							value: '00:00'　
						}
					]
				},
				{
					xtype : 'button',	
					text : '上記保存',
					handler:function()
					{
							me.saveConfigData();
					}
				},{
					xtype: 'fieldset',
					title: '暗証番号変更',
					items: [
						{
							xtype: 'passwordfield',
								id:"oldpwd",
							name : 'oldpwd',
							label: '元暗証番号',
							value: ''　
						},
						{
							xtype: 'passwordfield',
								id:"newpwd",
							name : 'newpwd',
							label: '新暗証番号',
							value: ''　　
						},
								{
							xtype: 'passwordfield',
								id:"newpwd2",
							name : 'newpwd2',
							label: '再入力（確認）',
							value: ''　
						},{
					xtype : 'button',	
					text : '変更',
							handler:function()
						{
								me.changePWD(Ext.getCmp("oldpwd").getValue(),Ext.getCmp("newpwd").getValue(),Ext.getCmp("newpwd2").getValue()); 
						}
						}		
					]}
			]
		};
	},
	setWorktime:function()
	{
		var me =this;
		var sDate =  new Date(Ext.getCmp("starttime").getValue());
		var s = Ext.Date.format(sDate,"Hi");
		sDate =  new Date(Ext.getCmp("endtime").getValue());
		var e = Ext.Date.format(sDate,"Hi");
		var rest =Ext.Array.clone(me.resttime);
		Ext.getCmp("worktime").setValue(me.getTime(s,e,rest));
	},
    getInput:function(){
    	var dt = Ext.Date.add(new Date(), Ext.Date.DAY, 1);
		var me = this;
    	return {
    		    title: '記入',
	            iconCls: 'compose',
				id : 'tab_input',
				layout : 'vbox',
	            items:[	
					{
                    xtype: 'textfield',
                    label: '日付:',
					id : 'date',
					name : 'date',
                    labelWidth : '35% ',
                   readOnly:true
                },
				{
                    xtype: 'timepickerfield',
                    label: '開始時間:',
					id : 'starttime',
					name : 'starttime',
                    labelWidth : '35% ',
					listeners:{
						change:function( ts, newDate, oldDate, eOpts )
						{
							me.setWorktime();
						}
					}
                },{
                    xtype: 'timepickerfield',
                    label: '終了時間:',
					id : 'endtime',
					name : 'endtime',
                    labelWidth : '35%' ,
					slotOrder: ['hour','minute'],
					listeners:{
						change:function( ts, newDate, oldDate, eOpts )
						{
							me.setWorktime();
						}
					}
                }, {
					xtype : 'numberfield',
					labelWidth : '35%',
					label : '勤務時間:',
					id : 'worktime',
					name : 'worktime',
					value : ''
				},{
					id : 'rest',
					name:'rest',
                    xtype: 'selectfield',
                    label: '休み区分',
                    labelWidth : '35%',
                    options: me.rest_data
                },
				{
					id : 'reason',
					name:'reason',
                    xtype: 'selectfield',
                    label: '理由区分',
                    labelWidth : '35%',
                    options: me.reason_data
                },{
					id : 'memo',
					name:'memo',
					xtype : 'textfield',
					label : '備考:',
					labelWidth : '35%'
				}, 
				{
					xtype : 'fieldset',
					width : '100%',
					 hideBorders : false,
					layout:'hbox',
						baseCls:"x-fieldset_nb", //无边框
						defaults: {
							width: '30%'
							  
							},
					items:[
				{
					xtype : 'button',	
					text : '前日',
					style:{  
                        'margin-left':'20px',  
						'margin-right':'20px', 
                        'margin-top':'5px', 
						'margin-bottom':'5px'
                    },
					handler:function()
					{
							me.index--;
							if(me.index<0)
							{
								me.index = 0;
							}
							me.data = me.datas[me.index];
							me.getData();
					}

				}, 
				{
					xtype : 'button',
					text : '後日',
					align: 'right',
					style:{  
                         'margin-left':'20px',  
						'margin-right':'20px', 
                        'margin-top':'5px', 
						'margin-bottom':'5px'
                    },
					handler:function()
					{
							me.index++;
							if(me.index == me.datas.length)
							{
								me.index = me.datas.length-1;
							}
							me.data = me.datas[me.index];
							me.getData();
					}
				}
				]
				}, 
		{
					xtype : 'fieldset',
					width : '100%',
					 hideBorders : false,
					layout:'hbox',
						baseCls:"x-fieldset_nb", //无边框
						defaults: {
							width: '30%'
							  
							},
					items:[
				{
					xtype : 'button',	
					text : '保存',
						style:{  
                        'margin-left':'20px',  
						'margin-right':'20px', 
                        'margin-top':'5px', 
						'margin-bottom':'5px'
                    },
					handler:function()
					{
							var btn = this;
							btn.setDisabled(true);
							me.setData();
							delete me.data.status;//后台数据不需要
							me.data.user =me.user;
							me.data.validate = 1;
							me.data.confim = 1;
							me.submitData(me.data,function(){
								btn.setDisabled(false);
							});
					}
				}, 
				{
					xtype : 'button',
					text : '删除',
						align: 'right',
						style:{  
                         'margin-left':'20px',  
						'margin-right':'20px', 
                        'margin-top':'5px', 
						'margin-bottom':'5px'
                    },
					handler:function()
					{
						me.data.option ="d";//修正要
						btn.setDisabled(true);
						me.submitData(me.data,function()
						{
							btn.setDisabled(false);
							Ext.getCmp('panel_main').setActiveItem(0);
						}
						);
					}
				}
				]
				}
				]
	        };
    },
	resetPWD:function(email)
	{
		var data = {"name":Ext.getCmp("name").getValue(),"email":email,option:"r"};
		Ext.Ajax.request({
			url: '../../rspwd',
			method :'POST',
			params: data,
			success: function(response, opts) {
			  var obj = Ext.decode(response.responseText);
			 if(obj.success)
			{
					alert("リセットしました。请查看邮件。");
			}
			else
			{
					alert("リセット失敗、EMAIL入力错误。");
			}
		  console.dir(obj);
		},
		failure: function(response, opts) {
		  console.log('server erro:'+ response.status);
		}
		});
	},
	changePWD:function(pwd,newpwd,newpwd2)
	{
		if(newpwd!=newpwd2)
		{
			alert("新しい暗証番号と確認用暗証番号が一致してない。");
			return;
		}
		var me = this;
		var data = {user:me.user,"password":pwd,"newpassword":newpwd,option:"c"};
		Ext.Ajax.request({
			url: '../../pwd',
			method :'POST',
			params: data,
			success: function(response, opts) {
			  var obj = Ext.decode(response.responseText);
			 if(obj.success)
			{
					alert("変更しました。");
			}
			else
			{
					alert("変更失敗、暗証番号入力错误。");
			}
		  console.dir(obj);
		},
		failure: function(response, opts) {
		  console.log('server erro:'+ response.status);
		}
		});
	},
	getData:function()
	{
		var data = this.data;
		var fields = ["date","starttime","endtime","worktime","rest","reason","memo"];
		for(var i=0;i<fields.length;i++)
		{
			Ext.getCmp(fields[i]).setValue(data[fields[i]]);
		}
		 var myDate = this.tool.date(data["date"]); 
		 this.tool.setHM(myDate,data["starttime"]);
		 Ext.getCmp("starttime").setValue(myDate);
		 this.tool.setHM(myDate,data["endtime"]);
		 Ext.getCmp("endtime").setValue(myDate);	
	},
	setData:function()
	{
		var me = this;
		var fields = ["date","starttime","endtime","worktime","rest","reason","memo"];
		for(var i=0;i<fields.length;i++)
		{
			me.data[fields[i]] = Ext.getCmp(fields[i]).getValue();
		}
		var sDate =  new Date(Ext.getCmp("starttime").getValue());
		me.data["starttime"] = Ext.Date.format(sDate,"Hi");
		sDate =  new Date(Ext.getCmp("endtime").getValue());
		me.data["endtime"] = Ext.Date.format(sDate,"Hi");
		
	},
	//提交数据
	submitData:function(data,callback)
	{
			var me = this;
			Ext.Ajax.request({
				url: '../../wk/do',
				method :'POST',
				params: data,
				success: function(response, opts) {
				  var obj = Ext.decode(response.responseText);
				 if(obj.success){					
					if(obj.id)
					 {
							data.id = obj.id;
							alert("追加成功");
					 }else
					 {
							alert("更新成功");
					 }
					me.store.load({params :
					{
					'user':me.user, 
					'month':me.month}
					});
					if(callback)
					 {
						callback();
					 }
					
				 }
				  console.dir(obj);
				},
				failure: function(response, opts) {
				  console.log('server erro:'+ response.status);
				}
				});
	},
	//设置合计时间
	setAllTime:function()
	{
		var me = this;
		var bgcolor = "";
		if(me.alltime<me.config.mintime)
		{
			 bgcolor = "min";
		}
		else if(me.alltime>me.config.maxtime)
		{
			bgcolor = "max";
		}
		//'<div  style="background-color:'+bgcolor+';width:100%;height:100%">総計：</div>',
		Ext.getCmp("alltime").setHtml('<div  class = "div_'+bgcolor+'"style="width:100%;height:100%">見込み:'+me.alltime+'</div>');
		Ext.getCmp("actualtime").setHtml('<div　style="width:100%;height:100%">実際:'+me.actualtime+'</div>');
	},
	calAllTime:function(){
		var me = this;
		var a = 0.0;
		var c = 0.0;
		for(var i =0;i<me.datas.length;i++)
		{
			a += parseFloat(me.datas[i].worktime);
			if(me.datas[i].status == me.status.d)
			{
				c += parseFloat(me.datas[i].worktime);
			}
		}
		me.alltime = a.toFixed(2);
		me.actualtime = c.toFixed(2);
	},
	//休息日,TODO红日子获得
	restdate:function(str) {
		var me = this;
		var rtn = false;
		var a =  str.substring(0,4)+"-"+ str.substring(4,6)+"-" + str.substring(6,8);
		var _w = new Date(Date.parse(a)).getDay();
		if(me.config["r"+_w] == 0)
		{
			rtn = true;
		}
		return rtn;
    },
	getRestTime:function()
	{
		var resttimes = [];
		var me = this;
		for(var i=1;i<6;i++)
		{
			var obj = {};
			var s = parseInt(me.config["stime"+i]);
			var e = parseInt(me.config["etime"+i]);
			//2400未作处理处理
			if((s<e)&&(e!=0))
			{
				obj.s = s;
				obj.e = e;
				resttimes.push(obj);
			}
		}
		console.log("resttimes");
		 console.log(resttimes);
		return resttimes;
	},
	//s:开始时间 t:结束时间 rests:休息时间
	getTime:function(st,et,rests)
	{
		var time = 0;
		var times = [];
		var s = parseInt(st);
		var e = parseInt(et);
		var allRest = 0;
		var me = this;
		for(var i=0;i<rests.length;i++)
		{
			var rest = rests[i];
			if(rest.e>s)//结束时间大于开始时间开始计时
			{
				if(rest.s>e)//开始时间超过结束时间
				{
					break;
				}
				if(s>rest.s)
				{
					rest.s = s;
				}
				if(e<rest.e)
				{
					rest.e = e;
				}
				times.push(rest);
			}
			
		}

		for(var i=0;i<times.length;i++)
		{
			
			var s_t = me.tool.getHM(me.tool.pad(times[i].s,4));
			var e_t = me.tool.getHM(me.tool.pad(times[i].e,4));
			var diff = Ext.Date.diff(s_t,e_t,"s");
			allRest+=diff;
		}
		var s_t = me.tool.getHM(me.tool.pad(st,4));
		var e_t = me.tool.getHM(me.tool.pad(et,4));
		var diff_ = Ext.Date.diff(s_t,e_t,"s");
		time = diff_ - allRest;

		console.log("time:"+time);
		var c = 0.0;
		c = time/3600;
		c = c.toFixed(2);
		return c;
	},
	//更换数据
	changeDatas:function(store)
	{
		var me = this;
		me.resttime = me.getRestTime();
		var rest =Ext.Array.clone(me.resttime);
		var count = store.data.all.length; 
		for(var i =0;i<count;i++)
		{
			me.changeData(store.data.getAt(i).data,i,rest);
		}
	},
	changeData:function(data,index,rest)
	{
		var me = this;
		var n_d = new Date().getDate();//获取当前日期
		var nowDate = parseInt(Ext.Date.format(new Date(),"Ymd"));
		var judgeDate = parseInt(data.date);
		var status = me.status.f;//未来
		console.log("changeData");
		console.log(data);
		if(me.restdate(data.date))//休息日，优先判断休息日
		{
			status = me.status.n;//不需要
		}
		else if(judgeDate<=nowDate)//如果日子已过去,当前月份判断日子，以后月份全部
		{
			status = me.status.u;
		}

		if(data.confim == 0)//需要修正
		{
			if(status != me.status.n)
			{
				data.starttime = me.config.starttime;
				data.endtime = me.config.endtime;
				if(!Ext.isDefined(data.starttime))
				{
					data.starttime="0000";
				}
				if(!Ext.isDefined(data.endtime))
				{
					data.endtime="0000";
				}
				data.worktime = me.getTime(data.starttime,data.endtime,rest);
			}
		}
		else
		{
			status =  me.status.d;
		}
		data.status = status;
		return data;
	},
	
getAdminConfiguration: function() {
		var me = this;
		
		var month = Ext.create('Ext.field.DatePicker', {
					id: 'month_admin',
					fieldLabel:　'月份',
					width : 120,
					xtype:　'datepickerfield',
					dateFormat :"Y-m",
					editable　:　false
					//value:new Date().dateFormat('Y-m')
		});
		var monthPicker = Ext.create('Ext.picker.Date', {
			yearFrom: 2016,
			yearTo  : 2050,
			slotOrder:['year','month']
		});

	   month.setPicker(monthPicker);
	   month.setValue(new Date());
      
	   month.on("change",function(){
			me.adminstore.load({params :
				{
					'month':Ext.Date.format(Ext.getCmp("month_admin").getValue(),"Ym")
				}
			});
		});

		var btn_excel = 
				{
					xtype : 'button',	
					text : 'E',
					id:"btn_excel",
					iconCls:'organize',
					name:"btn_excel",
					align:'right',
					handler:function()
					{
							var month = Ext.Date.format(Ext.getCmp("month_admin").getValue(),"Ym");
							window.open("/excel/"+month, '_blank');
					}
				};

				var btn_sort = 
				{
					xtype : 'button',	
					text : 'S',
					id:"btn_sort",
					iconCls:'arrow_down',
					name:"btn_sort",
					align:'left',
					handler:function()
					{
							me.adminstore.sort([
							{
								property : 'status',
								direction: 'ASC'
							},
							{
								property : 'no',
								direction: 'ASC'
							}
						]);
					}
				};
				var chart = Ext.create('OpenCharts.charts.PieChart', {
						chartOptions: {
								x: function(d) { return d.label+"("+d.value+")"; },
								y: function(d) { return d.value; },
								 staggerLabels: true,
								 tooltips: false,
								 showValues: true
							}
						});
			
						var popup = new Ext.Panel({  
							floating: true,  
							centered: true, 
							modal: true,  
							width: 300,  
							height: 400,  
							styleHtmlContent: true,  
							items: [
										{
										  docked: 'top',
										  xtype: 'titlebar',
										  items: [
											  {  
												text: '閉じる', 
													align:"left",
												handler: function(){  
													popup.hide();  
												} 
												}															
											]
										 }
									]
						}); 
						popup.add(chart);
						

				var btn_chart = 
				{
					xtype : 'button',	
					text : 'C',
					id:"btn_chart",
					iconCls:'info',
					name:"btn_chart",
					align:'left',
					handler:function(btn)
					{

						popup.showBy(btn);
					
						//注意顺序 先生成 再装载数据
						var co = {a:0,b:0,c:0};
						for(var i =0;i<me.admindatas.length;i++)
						{
							var obj = me.admindatas[i];
							if(obj.status==0)
							{
								co.a++;
							}
							else if(obj.status==1)
							{
								co.b++;
							}
							else
							{
								co.c++;
							}
						}
						chart.renderChartData([{"label":"正常","value":co.a},{"label":"不足","value":co.b},{"label":"超える","value":co.c}]);
						
					}
				};
		var btn_email  =  
		{
			xtype : 'button',	
			text : 'M',
			iconCls:'reply',
			id:"btn_email",
			name:"btn_email",
			align:'right',
			handler:function()
			{
				var data = {"tomail":me.tomail};
				Ext.Ajax.request({
				url: '../../wk/email',
				method :'POST',
				params: data,
				success: function(response, opts) {
					var obj = Ext.decode(response.responseText);
					if(obj.success)
					{
						alert("発送成功。");
					}
				},
				failure: function(response, opts) {
				  console.log('server erro:'+ response.status);
				}
				});
			}
		};

        me.adminstore = Ext.create('Ext.data.Store', {
            //give the store some fields
            fields: ['id','eid','no','name','month','actualtime','alltime','mintime','maxtime'],
            sorters: 'no',			
				listeners:{
				load:function(st, records)
				{
					me.tomail = "";
					me.admindatas =[];
					for(var i  = 0;i<records.length;i++)
					{
						var v = records[i].data;
						v.status = 0;
						if(v.alltime<v.mintime)
						{
							v.status = 1;//不足,需要提醒
							me.tomail = me.tomail + ","+v.eid+"";
						}
						else if(v.alltime>v.maxtime)
						{
							v.status = 2;
						}
						me.admindatas.push(v);
					}
					if(me.tomail.length>0)
					{
							me.tomail = me.tomail.substr(1, me.tomail.length);//去除#
					}
					
				}
			},
            proxy: {
            	type: 'ajax',
            	url: '../../wk/alist',
    	        reader: {
    	        	type: 'json',
    	        	root: 'data'
    	        },
				actionMethods: {
                create : 'POST',
                read   : 'POST', // by default GET
                update : 'POST',
                destroy: 'POST'
            },
    	        extraParams: {
    	            'month':Ext.Date.format(Ext.getCmp("month_admin").getValue(),"Ym")
    	    	}
            }
        });

        return {
			items: [
			{
              docked: 'top',
              xtype: 'titlebar',
              items: [
                 month
				  ,btn_sort
				  ,btn_chart
				  ,btn_email
				 ,btn_excel
				]
			 }
			],
			id:'list_admin',
            xtype: 'list',
            scrollable: {
                direction: 'vertical'
            },
			variableHeights: true,
            itemHeight  :10,
			store:me.adminstore,
            itemTpl: new Ext.XTemplate(
				//'<table><tr><td height="40" bgcolor ="{status}">{[this.date(values.date)]}【{starttime}~{endtime}】:{worktime} ({[this.rest(values.rest)]})</td></tr></table>',
				'<div  class = "{[this.status(values)]}" style="width:100%;height:100%">{name}:{mintime}~{maxtime}【 {actualtime}⇒{alltime}】</div>',
				{
					status: function(v){
						var bgcolor = "";
						if(v.alltime<v.mintime)
						{
							 bgcolor = "div_min";
						}
						else if(v.alltime>v.maxtime)
						{
							bgcolor = "div_max";
						}
						console.log(v);
						console.log(bgcolor);
					   return bgcolor;
					}
				}
			)
        };
    },



    getListConfiguration: function() {
		var me = this;
		Ext.Date.monthNames = [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12"
		];
		var month = Ext.create('Ext.field.DatePicker', {
					id: 'month',
					fieldLabel:　'月份',
					width : 120,
					xtype:　'datepickerfield',
					dateFormat :"Y-m",
					editable　:　false
					//value:new Date().dateFormat('Y-m')
		});
		var monthPicker = Ext.create('Ext.picker.Date', {
			yearFrom: 2016,
			yearTo  : 2050,
			slotOrder:['year','month']
		});

	   month.setPicker(monthPicker);
	   month.setValue(new Date());
      
	   month.on("change",function(){
			me.month = Ext.Date.format(Ext.getCmp("month").getValue(),"Ym");
			me.store.load({params :
			{
				'user':me.user, 
				'month':me.month}
			});
		});
		
		var actualtime = {
					id: 'actualtime',
					width : 90,
					xtype:　'label',
					html:　"実際:"
		};

		var all_time = {
					id: 'alltime',
					width : 90,
					xtype:　'label',
					html:　"見込み:"
		};

		var lbl_user_name = 
			{
					xtype : 'label',	
					id:"lbl_user_name",
					name:"lbl_user_name",
					align:'right',
					html:""
			};
		me.datas = [];
        me.store = Ext.create('Ext.data.Store', {
            //give the store some fields
            fields: ['id','date','starttime','endtime','worktime','rest','reason','status','memo','confim'],
            //filter the data using the firstName field
            sorters: 'date',
            //autoload the data from the server
            //autoLoad: true,
			listeners:{
				load:function(st, records)
				{
					
					me.changeDatas(st);//更换数据,重新计算时间等多种变量
					Ext.getCmp('list_list').setStore(null);
					Ext.getCmp('list_list').setStore(me.store);//此处刷新数据后，重新绑定
					
					me.datas = [];
					for(var i  = 0;i<records.length;i++)
					{
							me.datas.push(records[i].data);
					}
					if(me.config.mintime)
					{
						me.calAllTime();//计算总计时间
						me.setAllTime();//设置合计时间
						me.saveAllTime();
					}
				}
			},
            proxy: {
            	type: 'ajax',
            	url: '../../wk/list',
    	        reader: {
    	        	type: 'json',
    	        	root: 'data'
    	        },
				actionMethods: {
                create : 'POST',
                read   : 'POST', // by default GET
                update : 'POST',
                destroy: 'POST'
            },
    	        extraParams: {
    	            'user':me.user, 
    	            'month':me.month
    	    	}
            }
        });
        return {
			items: [
			{
              docked: 'top',
              xtype: 'titlebar',
              items: [
                 month
				  ,actualtime
				 ,all_time
				  ,lbl_user_name
				]
			 }
			],
			id:'list_list',
            xtype: 'list',
            scrollable: {
                direction: 'vertical'
            },
			variableHeights: true,
            itemHeight  :10,
            itemTpl: new Ext.XTemplate(
				//'<table><tr><td height="40" bgcolor ="{status}">{[this.date(values.date)]}【{starttime}~{endtime}】:{worktime} ({[this.rest(values.rest)]})</td></tr></table>',
				'<div  style="background-color:{status};width:100%;height:100%">{[this.date(values.date)]}【{[this.time(values.starttime)]}~{[this.time(values.endtime)]}】:{worktime} ({[this.rest(values.rest)]})</div>',
				{
					rest: function(v){
					   return me.tool.getListText(v,me.rest_data);
					},
					date:function(v){
					   return me.tool.day(v)+"("+me.tool.jweek(v)+")";
					},
					time:function(v){
					   return me.tool.timeStr(v);
					}
				}
			),
            listeners: {
                selectionchange:function (view, records) {
                	var data=records[0].data;
					me.index = parseInt(data.date.substring(6,8)) - 1//日期设为Index
					me.data = me.datas[me.index];
                	Ext.getCmp('panel_main').setActiveItem(1);
					me.getData();
                }}
        };
    }
});
