/*
 * Treeview 1.4.1 - jQuery plugin to hide and show branches of a tree
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-treeview/
 * http://docs.jquery.com/Plugins/Treeview
 *
 * Copyright (c) 2007 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.treeview.js 5759 2008-07-01 07:50:28Z joern.zaefferer $
 *
 */

;(function($) {

	// TODO rewrite as a widget, removing all the extra plugins
	$.extend($.fn, {
		swapClass: function(c1, c2) {
			var c1Elements = this.filter('.' + c1);
			this.filter('.' + c2).removeClass(c2).addClass(c1);
			c1Elements.removeClass(c1).addClass(c2);
			return this;
		},
		replaceClass: function(c1, c2) {
			return this.filter('.' + c1).removeClass(c1).addClass(c2).end();
		},
		hoverClass: function(className) {
			className = className || "hover";
			return this.hover(function() {
				$(this).addClass(className);
			}, function() {
				$(this).removeClass(className);
			});
		},
		heightToggle: function(animated, callback) {
			animated ?
				this.animate({ height: "toggle" }, animated, callback) :
				this.each(function(){
					jQuery(this)[ jQuery(this).is(":hidden") ? "show" : "hide" ]();
					if(callback)
						callback.apply(this, arguments);
				});
		},
		heightHide: function(animated, callback) {
			if (animated) {
				this.animate({ height: "hide" }, animated, callback);
			} else {
				this.hide();
				if (callback)
					this.each(callback);				
			}
		},
		prepareBranches: function(settings) {
			if (!settings.prerendered) {
				// mark last tree items
				this.filter(":last-child:not(ul)").addClass(CLASSES.last);
				// collapse whole tree, or only those marked as closed, anyway except those marked as open
				this.filter((settings.collapsed ? "" : "." + CLASSES.closed) + ":not(." + CLASSES.open + ")").find(">ul").hide();
			}
			// return all items with sublists
			return this.filter(":has(>ul)");
		},
		applyClasses: function(settings, toggler) {
			// TODO use event delegation
			
			//===== start sdang phan nay them su kien click vao node cua tree. (comment by ddo)
			if(flag_group||flag_folder)
				{
				this.filter(":has(>ul):not(:has(>a))").find(">span")
				.unbind("click.treeview").bind("click.treeview", function(event) {
					if ( this == event.target ){
						toggler.apply($(this).next());
					}
				}).add( $("a", this) ).css({cursor: "pointer", display: "inline"});	
				}

			if(flag_shared)
				{

				$('li').filter('.cursor').find(">span").unbind("click").unbind("click.treeview").bind("click", function(event) {
					var key =  $(this).context.id.replace(/\d/g,'');
					
					switch(key)
					{	
					case prefix_folder:

					var li =$('#'+ $(this).context.id);
					//TODO: load exericse
					//debugger;
					var exercise_id =	li.attr('exerciseid');
					if(exercise_id)
					{
						if(ExercisesMenu.is_request)
						{
							break;
						}
						
						Exercise.current.index =1;
						Exercise.current.latex =li.attr('latex');
						Exercise.current.variable =li.attr('variable');
						Exercise.current.folder_id=$(this).context.id;
						Exercise.current.content=li.text();
						Exercise.current.exercise_id = exercise_id;
						Exercise.current.xiznum= li.attr('xiznum');
						Exercise.current.friendly_id= li.attr('friendlyid');
						ExercisesMenu.selected_tree(Exercise.current);
						var lis2 =	$('#browser li.cursor>span.selected').removeClass('selected');
						$('#'+ $(this).context.id).addClass('selected');
						break;
					}
					
					if(li.hasClass('selected'))
					{
						if(li.hasClass('active'))
						{
							li.removeClass('secleted-actvie');
						}
						li.removeClass('selected');
						var exerid =li.attr('exerciseid');
						var id =	li.attr('id');
						$('#f' + id).remove();
					}
					else{
						if(li.hasClass('active'))
						{
							li.addClass('secleted-actvie');
						}
						li.addClass('selected');

						var exerid =li.attr('exerciseid');
						var id =	li.attr('id');
						var fzid = id;
						if(exerid)
						{
							id = $('#'+id).parent().parent().parent().find('>span:first');
							id = id.attr('id');
						}
						
						var item = {id:id, name:li.text(), exerid: exerid};
						var li2 ='<li onclick="removeSelect(this)" id="f' +fzid+
						'" class="cursor sharedlist" folderid = "'+item.id +  '"  exerid="'+(item.exerid?item.exerid:'')+'"><span >'
						+
						(item.exerid?class_icon_book+'':class_icon_folder_open+'')			
						+item.name+'</span></li>';
						$('#sharedfolder').append(li2);
					}
					break;

					case prefix_group:
						var li =$('#'+ $(this).context.id);
						if(li.hasClass('selected'))
							{
							if(li.hasClass('active'))
							{
							li.removeClass('secleted-actvie');
							}
							li.removeClass('selected');
							$('#g' + li.attr('id')).remove();
							/*
							var usesrid =li.attr('usesrid');
							var id =	li.attr('id');
							if(usesrid)
								{
								id = $('#'+id).parent().parent().parent().find('>span:first');
								id = id.attr('id');
								}

							$('#f' + id).remove();
							*/
							var userid =li.attr('userid');
							if(userid){
							   // start removing the highlight of the same user that assigned to different groups
                        var users = group_users.filter(
                              function (item) {
                                 return item.userId == userid;
                              }
                         );  
                        for ( var g = 0; g < users.length; g++){
                           var node =$("#group"+users[g].id);
                           if(node.attr("id") != id){
                              node.removeClass("selected");
                           }
                           $('#g' + node.attr('id')).remove();
                        }
                        // end of removing the highlight of the same user that assigned to different groups  
							}
						}
						else{
							if(li.hasClass('active'))
							{
								li.addClass('secleted-actvie');
							}
							li.addClass('selected');
							var userid =li.attr('userid');
							var id =	li.attr('id');
							var guserid =id; 
							if(userid){
								id = $('#'+id).parent().parent().parent().find('>span:first');
								id = id.attr('id');
								
								// start highlighting the same user that assigned to different groups
                        var users = group_users.filter(
                              function (item) {
                                 return item.userId == userid;
                              }
                         );  
                        for ( var g = 0; g < users.length; g++){
                           var node =$("#group"+users[g].id);
                           if(node.attr("id") != id){
                              node.addClass("selected");
                           }
                        }
                        // end of highlighting the same user that assigned to different groups	
							}
							var item = {id:id, name:li.text(), userid:userid };
							var li2 ='<li onclick="removeSelect(this)" id="g' +guserid+'" class="cursor sharedlist" groupid="'
								 +item.id +'"  userid="'+(item.userid?item.userid:'')+'">  <span>'
							+(item.userid?class_icon_user+'':class_icon_th_list+'')
							+item.name+'</span></li>';
							$('#sharedgroup').append(li2);
						}
					break;
					}
				});
				}
			if (!settings.prerendered) {
				// handle closed ones first
				this.filter(":has(>ul:hidden)")
						.addClass(CLASSES.expandable)
						.replaceClass(CLASSES.last, CLASSES.lastExpandable);
						
				// handle open ones
				this.not(":has(>ul:hidden)")
						.addClass(CLASSES.collapsable)
						.replaceClass(CLASSES.last, CLASSES.lastCollapsable);
						
	            // create hitarea if not present
				var hitarea = this.find("div." + CLASSES.hitarea);
				if (!hitarea.length)
					hitarea = this.prepend("<div class=\"" + CLASSES.hitarea + "\"/>").find("div." + CLASSES.hitarea);
				hitarea.removeClass().addClass(CLASSES.hitarea).each(function() {
					var classes = "";
					$.each($(this).parent().attr("class").split(" "), function() {
						classes += this + "-hitarea ";
					});
					$(this).addClass( classes );
				})
			}
			
			// apply event to hitarea
			this.find("div." + CLASSES.hitarea).click( toggler );
		},
		
		treeview: function(settings) {
			
			settings = $.extend({
				cookieId: "treeview"
			}, settings);
			
			if ( settings.toggle ) {
				var callback = settings.toggle;
				settings.toggle = function() {
					return callback.apply($(this).parent()[0], arguments);
				};
			}
		
			// factory for treecontroller
			function treeController(tree, control) {
				// factory for click handlers
				function handler(filter) {
					return function() {
						// reuse toggle event handler, applying the elements to toggle
						// start searching for all hitareas
						toggler.apply( $("div." + CLASSES.hitarea, tree).filter(function() {
							// for plain toggle, no filter is provided, otherwise we need to check the parent element
							return filter ? $(this).parent("." + filter).length : true;
						}) );
						return false;
					};
				}
				// click on first element to collapse tree
				$("a:eq(0)", control).click( handler(CLASSES.collapsable) );
				// click on second to expand tree
				$("a:eq(1)", control).click( handler(CLASSES.expandable) );
				// click on third to toggle tree
				$("a:eq(2)", control).click( handler() ); 
			}
		
			// handle toggle event
			function toggler() {
				//===== start sdang
				$("span").removeClass("active");
				
				if ($(this).context.id != ""){
					_current_tag = $(this).context.id;
					try{
						load_children_by_parentid(_current_tag);	
					}catch (e) {
						// TODO: handle exception
						console.log("Loi load_user_by_group");
					}
					
					$("#" + _current_tag).addClass("active");
					
				}
				else if($(this).hasClass("hitarea")){
					_current_tag = $(this).parent().context.nextSibling.id;
					$("#" + _current_tag).addClass("active");
					
				}
				//===== end
				$(this)
					.parent()
					// swap classes for hitarea
					.find(">.hitarea")
						.swapClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
						.swapClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea )
					.end()
					// swap classes for parent li
					.swapClass( CLASSES.collapsable, CLASSES.expandable )
					.swapClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
					// find child lists
					.find( ">ul" )
					// toggle them
					.heightToggle( settings.animated, settings.toggle );
				if ( settings.unique ) {
					$(this).parent()
						.siblings()
						// swap classes for hitarea
						.find(">.hitarea")
							.replaceClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
							.replaceClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea )
						.end()
						.replaceClass( CLASSES.collapsable, CLASSES.expandable )
						.replaceClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
						.find( ">ul" )
						.heightHide( settings.animated, settings.toggle );
				}
			}
			this.data("toggler", toggler);
			
			function serialize() {
				function binary(arg) {
					return arg ? 1 : 0;
				}
				var data = [];
				branches.each(function(i, e) {
					data[i] = $(e).is(":has(>ul:visible)") ? 1 : 0;
				});
				$.cookie(settings.cookieId, data.join(""), settings.cookieOptions );
			}
			
			function deserialize() {
				var stored = $.cookie(settings.cookieId);
				if ( stored ) {
					var data = stored.split("");
					branches.each(function(i, e) {
						$(e).find(">ul")[ parseInt(data[i]) ? "show" : "hide" ]();
					});
				}
			}
			
			// add treeview class to activate styles
			this.addClass("treeview");
			
			// prepare branches and find all tree items with child lists
			var branches = this.find("li").prepareBranches(settings);
			
			switch(settings.persist) {
			case "cookie":
				var toggleCallback = settings.toggle;
				settings.toggle = function() {
					serialize();
					if (toggleCallback) {
						toggleCallback.apply(this, arguments);
					}
				};
				deserialize();
				break;
			case "location":
				var current = this.find("a").filter(function() {
					return this.href.toLowerCase() == location.href.toLowerCase();
				});
				if ( current.length ) {
					// TODO update the open/closed classes
					var items = current.addClass("selected").parents("ul, li").add( current.next() ).show();
					if (settings.prerendered) {
						// if prerendered is on, replicate the basic class swapping
						items.filter("li")
							.swapClass( CLASSES.collapsable, CLASSES.expandable )
							.swapClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
							.find(">.hitarea")
								.swapClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
								.swapClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea );
					}
				}
				break;
			}
			
			branches.applyClasses(settings, toggler);
				
			// if control option is set, create the treecontroller and show it
			if ( settings.control ) {
				treeController(this, settings.control);
				$(settings.control).show();
			}
			
			return this;
		}
	});
	
	// classes used by the plugin
	// need to be styled via external stylesheet, see first example
	$.treeview = {};
	var CLASSES = ($.treeview.classes = {
		open: "open",
		closed: "closed",
		expandable: "expandable",
		expandableHitarea: "expandable-hitarea",
		lastExpandableHitarea: "lastExpandable-hitarea",
		collapsable: "collapsable",
		collapsableHitarea: "collapsable-hitarea",
		lastCollapsableHitarea: "lastCollapsable-hitarea",
		lastCollapsable: "lastCollapsable",
		lastExpandable: "lastExpandable",
		last: "last",
		hitarea: "hitarea"
	});
	
})(jQuery);