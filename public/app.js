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
    	 var rentPanel= Ext.create('Ext.Panel', {
				id : 'panel_rent',
				layout : 'hbox',
				width : '100%',
				items : [ Ext.create('Ext.Panel', {
					id : 'rent_button',
					layout : 'hbox',
					width : '100%',
					items : [ {
						xtype : 'button',
						width : '50%',
						text : '提交'
					} ]
				}) ]
			}); 

    	 
    	
    	Ext.create('Ext.TabPanel', {
    	    fullscreen: true,
    	    tabBarPosition: 'bottom',
    	    id:'panel_main',
    	    defaults: {
    	        styleHtmlContent: true
    	    },

    	    items: [
    	       me.getIndex(),
    	       me.getInput(),
				me.getConfig(),
    	        {
    	            title: '説明',
    	            iconCls: 'organize',
    	            html: '注意事项 交费说明等'
    	        }
    	    ]
    	});
			Ext.getCmp('panel_main').setActiveItem( 2);
    },
    getIndex:function(){
    	var me=this;
    	var listConfiguration =  me.getListConfiguration();
    	return {
            title: '一覧',
            iconCls: 'home',
			id : 'tab_index',
			layout : 'card',
			items: [listConfiguration]
    	};
    	
    },
	getConfig:function(){
		return {
         title: '設定',
         iconCls: 'star',
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
				}
			]
		};
	},
    getInput:function(){
    	var dt = Ext.Date.add(new Date(), Ext.Date.DAY, 1);
    	return {
    		    title: '記入',
	            iconCls: 'user',
				id : 'tab_input',
				layout : 'vbox',
	            items:[	
					{
                    xtype: 'datepickerfield',
                    label: '日付:',
					name : 'starttime',
                    labelWidth : '35% ',
                    value:new Date()
                },
				{
                    xtype: 'timepickerfield',
                    label: '開始時間:',
					name : 'starttime',
                    labelWidth : '35% ',
                    value:new Date()
                },{
                    xtype: 'timepickerfield',
                    label: '終了時間:',
					name : 'endtime',
                    labelWidth : '35%' ,
					slotOrder: ['hour','minute'],
                    value:new Date()
                }, {
					xtype : 'textfield',
					labelWidth : '35%',
					label : '勤務時間:',
					name : 'time',
					value : '1',
					readOnly:true
				},{
                    xtype: 'selectfield',
                    label: '休み区分',
                    labelWidth : '35%',
                    options: [
						{text: '--',  value: '0'},
                        {text: '全休',  value: '1'},
                        {text: '午前休', value: '2'},
						{text: '午後休', value: '3'},
						{text: '遅刻', value: '4'},
						{text: '早退', value: '5'},
						{text: 'その他', value: '6'}
                    ]
                },
				{
                    xtype: 'selectfield',
                    label: '理由区分',
                    labelWidth : '35%',
                    options: [
						{text: '--',  value: '0'},
                        {text: '私用',  value: '1'},
                        {text: '体調不良', value: '2'},
						{text: '帰社', value: '3'},
						{text: '帰国', value: '4'},
						{text: '看病', value: '5'},
						{text: 'その他', value: '6'}
                    ]
                },{
					xtype : 'textfield',
					label : '備考:',
					labelWidth : '35%',
					value : ' '
				}, 
				{
					xtype : 'button',
					width : '100%',
					text : '提交'
				}, 
				{
					xtype : 'button',
					width : '100%',
					text : '前日'
				}, 
				{
					xtype : 'button',
					width : '100%',
					text : '後日'
				} ]
	        };
    },  
    getListConfiguration: function() {
        //create a store instance
        var store = Ext.create('Ext.data.Store', {
            //give the store some fields
            fields: ['id','title','url','memo','price','aprice'],

            //filter the data using the firstName field
            sorters: 'id',
            //autoload the data from the server
            autoLoad: true,
       //     data: [     //直接把数组作为数据配置项。这些数据会被加工处理，最终形成record数组。
                 //       {id: 'Tommy', title: 'Maintz'}],
            //setup the proxy for the store to use an ajax proxy and give it a url to load
            //the local contacts.json file
            proxy: {
            	type: 'ajax',
            	url: '../../wk/3/list',
    	        reader: {
    	        	type: 'json',
    	        	root: 'data'
    	        },
    	                extraParams: {
    	                	'sql':'boat', 
    	                	'option':'select' 
    	    	}
            }
        });

        return {
            xtype: 'list',
            scrollable: {
                direction: 'vertical'
            },
            itemHeight :30,
            itemTpl: '<table style="margin-bottom:-0.4em" border=0><tr><td width="100" height="5"  valign="top" rowSpan = 3 style="padding:0px"><img src="{url}"  height="75"   width="100"/>  </td><td><b>{title}</b></td>  </tr><tr><td>{memo}</td></tr><tr><td  style="padding:0px"><table width="100%" border=0  style="margin-bottom:0em" ><tr><td width="80">单人：{price} </td><td> 整船：{aprice}</td></tr></table></td></tr></table>',
            listeners: {
                selectionchange:function (view, records) {
                	var data=records[0].data;
                	Ext.getCmp('panel_main').setActiveItem( 1 );
                }},
                //bind the store to this list
                store: store
        };
    }
});
