/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

Ext.require(['*']);

Ext.onReady(function(){
    
    Ext.define('App.model.TreeModel', {
        extend:'Ext.data.Model',
        fields: ['id', 'name','description','create_on'],  
        proxy:{
            type:'ajax',
            url: 'usermode.jsp',
            
            reader:{
                type:'json',
                root:'rows'
            }
        }
    });
    
    var userTreeStore = Ext.create('Ext.data.TreeStore', {
        model: 'App.model.TreeModel',
        
        listeners: {
            beforeload: function(thisnode, node, callback)
            {
                /*node.params={
                    type:'1',name:2
                }*/
                var curnode = node.node;
                console.log("ten node: " + curnode.get("name") + " ngay tao: "  + curnode.get("create_on"));

                
            },
            append: function( thisNode, newChildNode, index, eOpts ) {
                if( !newChildNode.isRoot() ) {
                    if(newChildNode.get('name')=='connected')
                    {
                        
                        newChildNode.set('leaf', false);
                        newChildNode.set('id', newChildNode.get('id'));
                        newChildNode.set('create_on',newChildNode.get('create_on'));  
                        newChildNode.set('text',newChildNode.get('name'));        
                    }
                    else
                    {
                                
                        newChildNode.set('leaf', true);
                        newChildNode.set('id', newChildNode.get('id'));
                        newChildNode.set('text',newChildNode.get('name'));            
                    }
                    
                
                }
            }
        }
        
    });
    /*
     Ext.define('App.store.MyTreeStore', {
        extend: 'Ext.data.TreeStore',
        requires: ['App.model.TreeModel'],
        model:'App.model.TreeModel'
    });
    */
   
    userTreeStore.setRootNode({
        text: 'rows',
        leaf: false,
        expanded: false // If this were true, the store would load itself 
    // immediately; we do NOT want that to happen
    });
  

    var tree = Ext.create('Ext.tree.Panel', {
        id: 'tree',
        store:userTreeStore,
        width: 250,
        height: 300,
        viewConfig: {
            plugins: {
                ptype: 'treeviewdragdrop',
                appendOnly: true
            }
        },
        listeners:{
           
            itemclick: function(view,rec,item,index,eventObj)
            {  
                if(rec.isLeaf())
                {
                    alert(index);                  
                }
                    
            }
            
        },
        renderTo: document.getElementById("center")
    });

});