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
    launch: function() {
    	var me = this;
		this.tool = new Tool();
		me.user = -1;
		me.data = {};//当前选中data,便于删除修改添加用
		me.datas = [];
		me.index = 0;//当前数据序号，实际用日期也可取。
		me.month = Ext.Date.format(new Date(),"Ym");//当前月份
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
    	me.mainPanel = Ext.create('Ext.TabPanel', {
    	    fullscreen: true,
    	    tabBarPosition: 'bottom',
    	    id:'panel_main',
    	    defaults: {
    	        styleHtmlContent: true
    	    },
			activeItem:3,
    	    items: [
				me.panel_list,
				me.panel_input,
				me.panel_config,
				me.getLogin()
    	    ]
    	});
		//Ext.getCmp('panel_main').setActiveItem(3);//初次启动，登录页面

		me.mainPanel.on("activeitemchange",function(tb, value, oldValue, eOpts){
			if(me.user == -1)
			{
					Ext.getCmp('panel_main').setActiveItem(3);//初次启动，登录页面
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
								 if(obj.success){
									me.user = obj.user;
									me.role = obj.role;
									me.store.load({params :
									{
										'user':me.user, 
										'month':me.month}
									});
									Ext.getCmp('panel_main').setActiveItem(0);
								}
								else
								{
										alert("用户名或密码错误。");
								}
				  console.dir(obj);
				},
				failure: function(response, opts) {
				  console.log('server-side failure with status code ' + response.status);
				}
				});
				}
				},
				{
					xtype : 'button',	
					text : '暗証番号リセット',
					handler:function()
					{
							me.user = 1;
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
	test:function(i){
		return i;
	},
	getConfig:function(){
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
							name : 'week0',
							label: '日'
						},
						{
							xtype: 'checkboxfield',
							name : 'week1',
							label: '月',
							checked: true
						},
						{
							xtype: 'checkboxfield',
							name : 'week2',
							label: '火',
							checked: true
						},
						{
							xtype: 'checkboxfield',
							name : 'week3',
							label: '水',
							checked: true
						},
						{
							xtype: 'checkboxfield',
							name : 'week4',
							label: '木',
							checked: true
						},
						{
							xtype: 'checkboxfield',
							name : 'week5',
							label: '金',
							checked: true
						},
						{
							xtype: 'checkboxfield',
							name : 'week6',
							label: '土' 
						}
					]
				},{
					xtype: 'fieldset',
					title: '作業制限',
					items: [
						{
							xtype: 'textfield',
							name : 'mintime',
							label: '最低時間',
							value:'140',
							readOnly:true
						},
						{
							xtype: 'textfield',
							name : 'maxtime',
							label: '最高時間',
							value:'180',
							readOnly:true　
						},						{
							xtype: 'timepickerfield',
							name : 'starttime',
							label: '開始時間',
							value:'9:00'
						},
						{
							xtype: 'timepickerfield',
							name : 'endtime',
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
							name : 'starttime1',
							label: '開始時間1',
							value: '00:00'　
						},
						{
							xtype: 'timepickerfield',
							name : 'endtime1',
							label: '終了時間1',
							value: '00:00'　　
						},
								{
							xtype: 'timepickerfield',
							name : 'starttime2',
							label: '開始時間2',
							value: '00:00'　
						},
						{
							xtype: 'timepickerfield',
							name : 'endtime2',
							label: '終了時間2',
							value: '00:00'　
						},
								{
							xtype: 'timepickerfield',
							name : 'starttime3',
							label: '開始時間3',
							value: '00:00'
						},
						{
							xtype: 'timepickerfield',
							name : 'endtime3',
							label: '終了時間3',
							value: '00:00'　　
						},
						{
							xtype: 'timepickerfield',
							name : 'starttime4',
							label: '開始時間4',
							value: '00:00'　
						},
						{
							xtype: 'timepickerfield',
							name : 'endtime4',
							label: '終了時間4',
							value: '00:00'　　
						},
								{
							xtype: 'timepickerfield',
							name : 'starttime5',
							label: '開始時間5',
							value: '00:00'　
						},
						{
							xtype: 'timepickerfield',
							name : 'endtime5',
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
							me.user = 1;
					}
				},{
					xtype: 'fieldset',
					title: '暗証番号変更',
					items: [
						{
							xtype: 'passwordfield',
							name : 'oldpwd',
							label: '元暗証番号',
							value: ''　
						},
						{
							xtype: 'passwordfield',
							name : 'newpwd',
							label: '新暗証番号',
							value: ''　　
						},
								{
							xtype: 'passwordfield',
							name : 'newpwd2',
							label: '再入力（確認）',
							value: ''　
						},{
					xtype : 'button',	
					text : '保存',
					handler:function()
					{
							me.user = 1;
					}
				}
							
							]}
			]
		};
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
                    value:new Date()
                },{
                    xtype: 'timepickerfield',
                    label: '終了時間:',
					id : 'endtime',
					name : 'endtime',
                    labelWidth : '35%' ,
					slotOrder: ['hour','minute'],
                    value:new Date()
                }, {
					xtype : 'textfield',
					labelWidth : '35%',
					label : '勤務時間:',
					id : 'worktime',
					name : 'time',
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
				  console.log('server-side failure with status code ' + response.status);
				}
				});
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
					width : 150,
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
        me.datas = [];
        me.store = Ext.create('Ext.data.Store', {
            //give the store some fields
            fields: ['id','date','starttime','endtime','worktime','rest','reason','status','memo'],
            //filter the data using the firstName field
            sorters: 'date',
            //autoload the data from the server
            //autoLoad: true,
			listeners:{
				load:function(st, records)
				{
					for(var i  = 0;i<records.length;i++)
					{
							me.datas.push(records[i].data);
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
		
		month.on("change",function(){
			me.month = Ext.Date.format(Ext.getCmp("month").getValue(),"Ym");
			me.store.load({params :
			{
				'user':me.user, 
				'month':me.month}
			});
		});
        return {
			items: [
			{
              docked: 'top',
              xtype: 'titlebar',
              items: [
                 month
				]
			 }
			],
            xtype: 'list',
            scrollable: {
                direction: 'vertical'
            },
			variableHeights: true,
            itemHeight  :10,
            itemTpl: new Ext.XTemplate(
				//'<table><tr><td height="40" bgcolor ="{status}">{[this.date(values.date)]}【{starttime}~{endtime}】:{worktime} ({[this.rest(values.rest)]})</td></tr></table>',
				'<div  style="background-color:{status};width:100%;height:100%">{[this.date(values.date)]}【{starttime}~{endtime}】:{worktime} ({[this.rest(values.rest)]})</div>',
				{
					rest: function(v){
					   return me.tool.getListText(v,me.rest_data);
					},
					date:function(v){
					   return me.tool.day(v)+"("+me.tool.jweek(v)+")";
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
                }},
                store: me.store
        };
    }
});
