Ext.require([ 'Ext.form.*', 'Ext.layout.container.Column', 'Ext.tab.Panel' ]);

/*
 * ! Ext JS Library 3.3.1 Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com http://www.sencha.com/license
 */
Ext.onReady(function() {

Ext.QuickTips.init();

// Add the additional 'advanced' VTypes
Ext.apply(Ext.form.field.VTypes,                                               {
password : function(val, field)                                                {
   if (field.initialPassField)                                                 {
      var pwd = field.up('form').down('#' + field.initialPassField);
      return (val == pwd.getValue());                                          }
   return true;                                                                },
   passwordText : 'Passwords do not match'                   /* end apply() */ });

Ext.define('umModel',                                                          {
   extend: 'Ext.data.Model',
   fields: ['id', 'name','description','create_on'],
   proxy:                                                                      {
      type: 'ajax', url:'./usermode.jsp', method: 'POST',
      reader: { type: 'json', root: 'rows' }                                } });

var dsCompany = Ext.create('Ext.data.Store',                                   {
   model: 'umModel',
   disableCaching:false,
   auotload:false                                                              });

var simple = Ext.create( 'Ext.form.Panel',                                     {
   xtype : 'form',  id : 'registry-form', url : './action/doregister.jsp',
   frame : true,    title : 'Register',   bodyStyle : 'padding:5px 5px 0',
   width : 500,     style : { margin : '0 auto', top : '50px' },
   fieldDefaults : { msgTarget : 'side',  labelWidth : 100    },
   defaultType : 'textfield',
   defaults : { anchor : '100%' },

   items : [
   { fieldLabel : 'First Name', name : 'first', allowBlank : false },
   { fieldLabel : 'Last Name',  name : 'last' },
   { fieldLabel : 'User Name',  name : 'username', id : 'username' },
   { fieldLabel : 'Password',   name : 'pass',    id : 'pass',
      inputType : 'password',   allowBlank : false, minLength : 3,
      maxLength : 32,
      minLengthText : 'Password must be at least 6 characters long.' },
   {  fieldLabel : 'Confirm Password', name : 'pass-cfrm',
      vtype : 'password',         inputType : 'password',
      initialPassField : 'pass' },       // id of the initial password field
   { fieldLabel : 'Email', name : 'email', id : 'email', vtype : 'email' },
   { xtype : 'datefield', fieldLabel : 'Birthday', name : 'birthday',
      allowBlank : false }, 
   {  fieldLabel : 'Address', name : 'address' },
   {  fieldLabel : 'Phone', name : 'phone' }, 
   {  xtype: 'combo',   name: 'usermode', id: 'usermode',
      fieldLabel: 'User Mode', mode: 'local', store: dsCompany,
      displayField:'name', valueField: 'id',  width: 130         }
   ],  // end "items"

   /*****************
   * buttons :                                                                   [ 
   * { text:'..', handler: f(..) {   submit({success:f(){..},failure:f(){..}})   }}
   * { text: ..                                                                  }]
   *****************/

   buttons : [
   { text : 'Save',  handler : function()                                   {
         Ext.getCmp('registry-form').getForm().submit(                      {
            waitMsg : 'Please wait...',
            success : function(action)                                      {
               Ext.Msg.alert( 'Status', 'Register is successful!'
               ,   function( btn, text) { if (btn == 'ok') { var redirect = './login.jsp'; window.location = redirect; } } ); }, // end success
            failure : function( a, action)                                  {
               if (action.failureType == 'server')                          {
                  var obj = Ext.JSON.decode(action.response.responseText);
                  Ext.Msg.alert( 'Register Fail!', obj.errors.reason);
            } } /* end "failure" */           /* end text:'Save' */  } ); } },
   { text : 'Cancel', handler:function() { Ext.getCmp('registry-form').getForm().reset(); }}
   ] // end buttons

   }); // end Ext.Create()
simple.render('center');
}); // end onReady()