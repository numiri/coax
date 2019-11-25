/*
 * jQuery Filter Demo
 * Matt Ryall
 * http://www.mattryall.net/blog/2008/07/jquery-filter-demo
 * 
 * Licensed under Creative Commons Attribution 3.0.
 * http://creativecommons.org/licenses/by/3.0/
 */

function get_all_children(iskeyup) {
	var data = {};
	if (flag_folder) {
		data = {
			fn : -1,
			group : -1,
			userId : "1",
			page : getCurrentPage(),
			keyword : getKeyword(),
			folderId : getGroupId()
		};
	} else if (flag_group) {
		data = {
			fn : -1,
			group : -1,
			userId : "1",
			page : getCurrentPage(),
			keyword : getKeyword(),
			groupId : getGroupId()
		};
	}
	get_all_children_ajax(data, iskeyup);
}

function get_all_children_ajax(data, iskeyup) {
	$.ajax({
		type : "get",
		url : get_url_single(),
		contentType : "application/json",
		dataType : "json",
		cache : false,
		data : data,
		success : function(data) {
			$('#userslist').empty();
			var list = '';
			if (flag_group) {
				var li = _.template(tmp_user_list, data);
				list += li;
			} else if (flag_folder) {
				var li = _.template(tmp_exercise_list, data);
				list += li;
			}
			$("#userslist .loading").remove();
			$("#userslist").append(list);
			page_count = data.pages;
			if (iskeyup && page_current <= page_count) {
				var paginghtml = build_paging(data.pages, 0);
				$('div.pagination ul').html(paginghtml);
			} else if (page_count < page_current && page_count != 0) {
				getUserByPage(page_count);
			} else {
				var paginghtml = build_paging(data.pages, page_current - 1);
				$('div.pagination ul').html(paginghtml);
			}
			enablebtn();
		},
		error: function(xmlhttp) {
		   if(isAjaxSessionTimeOut(xmlhttp)) return;
		}
	});
}

// xu li cho nut push user
function push_user() {
	clearflash();
	var li_selects = $("#userslist li." + class_select);
	var selected = [];
	var object_select = [];
	var init = {};
	if (flag_group) {
		init.prefix = 'user_select';
		init.keyId = 'userId';
		init.name = 'name';
		init.nameId = 'userId';
	} else if (flag_folder) {
		init.prefix = 'exer_select';
		init.keyId = 'exerciseId';
		init.name = 'exerciseName';
		init.nameId = 'exerciseId';
	}

	for ( var i = 0; i < li_selects.length; i++) {
		var user_id = li_selects[i].id;
		var name = $('#' + user_id + ' ' + tag_span).text();
		user_id = user_id.replace(init.prefix, '');
		var guserid = _.find(g_gusers, function(item) {
			return item[init.keyId] == user_id;
		});
		if (!guserid) {
			var user = {

			};
			user[init.name] = name;
			user[init.nameId] = user_id;
			object_select.push(user);
			selected.push(user_id);
		}
	}

	push_user_to_server(selected, object_select);
}

function push_user_to_server(selected, users_select) {
	// code
	if (_current_tag && selected.length) {
		// code
		disablebtn();
		var group_id = _current_tag.replace(/\D+/, '');
		var build_guser = [];
		var gusers = '';

		for ( var i = 0; i < selected.length; i++) {
			if (i == 0) {
				gusers += selected[i] + "," + group_id;
			} else {
				gusers += ";" + selected[i] + "," + group_id;
			}
		}

		var data = {};

		if (flag_group) {
			data = {
				fn : 0,
				gusers : gusers
			}
		} else if (flag_folder) {
			data = {
				fn : 0,
				fexers : gusers
			}
		}
		push_user_to_server_ajax(data, users_select, group_id);
	} else {
		$('#flash').html(get_message());
	}

}

function push_user_to_server_ajax(data, select, parentId) {
	$.ajax({
		url : get_url_by_parent(),
		type : "get",
		data : data,
		success : function(data, textStatus, xmlhttp) {
		   if(isAjaxSessionTimeOut(xmlhttp)) return;
			if (data) {
				var error = _.filter(data, function(item) {
					return item.id == 0;
				});
				var success_push = _.filter(data, function(item) {
					return item.id != 0;
				});
				write_error(error);
				write_success(success_push, select);
				add_tree(success_push, select, parentId);
				enablebtn();
				get_all_children();
				
				if (typeof InitDrag == 'function')
				{
					InitDrag();
			
					InitDrop();
				}
				
			} else {
				$('#flash').html('<p style="color">data is empty!</p>');
			}

		}
	});
}

function add_tree(data, select, parentid) {
	switch (_current_prefix) {
	case init_folder.parent_prefix:
		var folder = _.find(dtree_folder, function(item) {
			return item.id == parentid;
		});
		if (folder) {
			var temp_exercise ={
				exerciseId:'',
				exerciseName:'',
				folderId:folder.id,
				folderName:folder.name,
				id:''
			};
			for ( var i = 0; i < data.length; i++) {
				var item = data[i];
				var exercise = _.find(select, function(itemx){
					return itemx.id == item.id;
				});
				temp_exercise.exerciseId = exercise.exerciseId;
				temp_exercise.exerciseName = exercise.exerciseName;
				temp_exercise.id = item.id;
				
				branches=createItemLeft("#ul-" + init_folder.parent_prefix + folder.id,
						init_folder.parent_prefix + temp_exercise[init_folder.child_id],
						temp_exercise[init_folder.child_name],
						init_folder.class_child, 
						init_folder.attribute_name,
						temp_exercise[init_folder.attribute_value]);
				$("#ul-" + _current_tag).treeview({
					add : branches
				});
				folder_exers.push(temp_exercise);
			}
		}

		break;
	case init_group.parent_prefix:

		var group = _.find(dtree_group, function(item) {
			return item.id == parentid;
		});
		if (group) {
			var temp_user ={
					groupId:group.id,
					name:group.name,
					userId:'',
					username:'',
				id:''
			};
			for ( var i = 0; i < data.length; i++) {
				var item = data[i];
				var user = _.find(select, function(itemx){
					return itemx.userId == item.userId;
				});
				temp_user.userId = user.userId;
				temp_user.username = user.name;
				temp_user.id = item.id;
				
				
				branches=createItemLeft("#ul-" + init_group.parent_prefix + group.id,
						init_group.parent_prefix + temp_user[init_group.child_id],
						temp_user[init_group.child_name],
						init_group.class_child, 
						init_group.attribute_name,
						temp_user[init_group.attribute_value]);
				$("#ul-" + _current_tag).treeview({
					add : branches
				});
				group_users.push(temp_user);
			}
		}
		break;
	}
}

function append_html_to_guser(item) {
	if (flag_group) {
		var list = $('<li class="' + class_list + '" id="g_id' + item.id
				+ '" onclick="select_guser(' + item.id + ')" userid="'
				+ item.userId + '"></li>');
		var div =  '<span>' +class_icon_user  + item.name + '</span>';
		$(list).append(div);
		$("#" + list_guserslist).append(list);
	} else if (flag_folder) {
		var list = $('<li class="' + class_list + '"  id="f_id' + item.id
				+ '" onclick="select_fexer(' + item.id + ')" exerid="'
				+ item.exerciseId + '"></li>');
		var div = '<span>'+ class_icon_book + item.exerciseName + '</span>';
		$(list).append(div);
		$("#" + list_guserslist).append(list);
	}

}
// xu ly cho nut back user

function back_user() {
	clearflash();
	var guser_ids = [];
	var user_ids = [];
	var li_selects = $('#' + list_guserslist + ' li.selected');
	var init = {};
	if (flag_group) {
		init.prefix = 'g_id';
		init.attr = 'userid';
		init.id = 'userId'
	} else if(flag_folder) {
		init.prefix = 'f_id';
		init.attr = 'exerid';
		init.id = 'exerId'
	}
	for ( var i = 0; i < li_selects.length; i++) {
		var li = li_selects[i];
		var id = li.id.replace(init.prefix, '');
		var object = {
			id : id
		}
		object[init.id] = li.getAttribute(init.attr), guser_ids.push(object);
	}

	back_to_server(guser_ids);
}
// delete in
function back_to_server(object_ids) {
	if (_current_tag && object_ids.length) {
		disablebtn();
		var group_id = _current_tag.replace(/\D+/, '');
		var ids = '';

		for ( var i = 0; i < object_ids.length; i++) {
			var item = object_ids[i];
			if (flag_group) {
				if (i == object_ids.length - 1) {
					ids += item.id + "," + item.userId;
				} else {
					ids += item.id + "," + item.userId + ";";
				}
			} else if (flag_folder) {
				if (i == object_ids.length - 1) {
					ids += item.id + "," + item.exerId;
				} else {
					ids += item.id + "," + item.exerId + ";";
				}
			}

		}

		var data = {
			fn : 2,
			ids : ids,
			userId : _t_user_id
		};
		// code

		$.ajax({
			url : get_url_by_parent(),
			type : "get",
			data : data,
			success : function(data, textStatus, xmlhttp) {
			   if(isAjaxSessionTimeOut(xmlhttp)) return;
				//console.dir(data);
				if (data) {
					if (data) {
						var error = _.filter(data, function(item) {
							return item.id == 0;
						});
						var success_back = _.filter(data, function(item) {
							return item.id != 0;
						});

						for ( var i = 0; i < error.length; i++) {
							// TODO: lam cho phan error
						}
						delete_success(success_back, object_ids);
						remove_tree(success_back);
						enablebtn();
						get_all_children();
					}
				}
			}
		});

	} else {
		$('#flash').html(get_message());
	}
}

function remove_tree(data)
{
	switch (_current_prefix) {
	case init_folder.parent_prefix:
		_.each(data,function(item){
			$('#' + init_folder.tag_list + " #f" + init_folder.parent_prefix+ item.id).remove();
			delete_item(init_folder.url_action,init_folder.tag, dtree_folder,init_folder.parent_prefix+ item.id);
		})
		break;
	case init_group.parent_prefix:
		_.each(data,function(item){
			$('#' + init_group.tag_list + " #g" + init_group.parent_prefix+ item.id).remove();
			delete_item(init_group.url_action,init_group.tag, dtree_group,init_group.parent_prefix+ item.id);
		})
		break;
	}
}

function back_to_user(user_ids) {
	for ( var j = 0; j < user_ids.length; j++) {
		$('#user_select' + id).removeClass('ispush');
	}
	remove_guser(user_ids);
}

function remove_guser(user_ids) {
	index_ids = [];
	for ( var j = 0; j < user_ids.length; j++) {
		for ( var i = 0; i < global_g_user.length; i++) {
			var guser = global_g_user[i];
			var id = user_ids[j];
			if (id == guser.id) {
				index_ids.push(i);
			}
		}
	}
	for ( var k = index_ids.length; k > 0; k--) {
		var index = index_ids[k];
		global_g_user.splice(index, 1);
	}
	global_guserid_select = [];
}

// phan xu li select user list
function select_user(userid) {
	select_common(userid, 'user_select');
}
function select_exercise(exerid) {
	select_common(exerid, 'exer_select');
}
// phan xu li select guser list
function select_guser(userid) {
	select_common(userid, 'g_id');
}

function select_fexer(userid) {
	select_common(userid, 'f_id');
}

function select_common(id, prefix) {
	var class_select = 'selected';
	if ($('#' + prefix + '' + id).hasClass(class_select)) {
		$('#' + prefix + '' + id).removeClass(class_select);
	} else {
		$('#' + prefix + '' + id).addClass(class_select);
	}
	return false;
}

// xu ly cho group
function load_children_by_parentid(parent_id) {
	// set ispush=false cho moi phan tu global_g_user
	parent_id = parent_id.replace(/\D+/, '');
	var data = {};
	if (flag_group) {
		data = {
			fn : -1,
			groupId : parent_id,
			userId : _t_user_id
		}
	}
	if (flag_folder) {
		data = {
			fn : 3,
			folderId : parent_id,
			userId : _t_user_id
		}
	}

	$.ajax({
		type : "get",
		url : get_url_by_parent(),
		contentType : "application/json",
		dataType : "json",
		cache : false,
		data : data,
		success : function(data) {
			if (data) {
				g_gusers = data;
				if (g_gusers.length) {
					$('#' + list_guserslist).empty();
					$('#' + list_guserslist + ' ul li').removeClass('ispush');
					if (flag_group) {
						_.each(g_gusers, function(item) {
							item.name = item.username;
							return item;
						})
					}

					for ( var i = 0; i < g_gusers.length; i++) {
						var guser = g_gusers[i];
						append_html_to_guser(guser);
						var guser_id = guser.userId;
					}

					get_all_children();
				} else {
					$('#' + list_guserslist).empty();
					$('#' + list_guserslist + ' ul li').removeClass('ispush');
					g_gusers = [];
					get_all_children();
				}
			} else {
				get_all_children();
				$('#' + list_guserslist).empty();
				$('#' + list_guserslist + ' ul li').removeClass('ispush');
				g_gusers = [];
			}
		},error: function(xmlhttp) {
		   if(isAjaxSessionTimeOut(xmlhttp)) return;
		}
	});

}

function build_paging(pages, active_page) {
	// code
	if (pages) {
		var paginghtml = '<li onclick="getUserPrevpage()"><a href="#">Prev</a></li>'
		for ( var i = 0; i < pages; ++i) {
			if (i == active_page) {
				paginghtml += '<li id="page' + (i + 1)
						+ '" onclick="getUserByPage(' + (i + 1)
						+ ')" class="active"><a href="#">' + (i + 1)
						+ '</a></li>';
			} else {
				if (i + 1 > page_show) {
					// code
					paginghtml += '<li id="page' + (i + 1)
							+ '" onclick="getUserByPage(' + (i + 1)
							+ ')" class="hidden"><a href="#">' + (i + 1)
							+ '</a></li>';
				} else {
					paginghtml += '<li id="page' + (i + 1)
							+ '" onclick="getUserByPage(' + (i + 1)
							+ ')" ><a href="#">' + (i + 1) + '</a></li>';
				}

			}

		}

		paginghtml += '<li id="linext"><a onclick="getUserNextpage()" href="#">Next</a></li>';
		return paginghtml;
	} else {
		return "";
	}

}

function getUserByPage(page) {
	// code
	$
			.ajax({
				type : "get",
				url : get_url_single(),
				contentType : "application/json",
				dataType : "json",
				cache : false,
				data : {
					fn : -1,
					page : page,
					keyword : $('#filter').val(),
					groupId : getGroupId()
				},
				success : function(data) {
					$("#userslist").empty();
					var list = '';
					if (flag_group) {
						var li = _.template(tmp_user_list, data);
						list += li;
					} else if (flag_folder) {
						var li = _.template(tmp_exercise_list, data);
						list += li;
					}
					page_count = data.pages;
					var paginghtml = build_paging(data.pages);
					$('div.pagination ul').html(paginghtml);

					$('div.pagination ul li').removeClass('active');
					$('#page' + page).addClass('active');
					$("#userslist .loading").remove();
					$("#userslist").append(list);
					page_current = page;

					disableNext();
					enablebtn();
					// phan nay phan trang

					if (page_current >= page_show) {
						if (page_show % 2 != 0) {
							var left = (page_show - 1) / 2;
							var right = left;

							if (page_current + right > page_count) {
								// code
								left += (page_current + right) - page_count;
								right -= (page_current + right) - page_count;
							}

							// hidden left
							for ( var i = 0; i < page_current - left - 1; i++) {
								// code
								$('#page' + (i + 1)).addClass('hidden');
							}
							// show left
							for ( var i = 0; i < left + 1; i++) {
								var id = page_current - (i);
								$('#page' + id).removeClass('hidden');
							}

							// hidden right;

							for ( var i = page_current + right; i < page_count; i++) {
								var id = (i + 1);
								$('#page' + id).addClass('hidden');
							}
							// show right
							for ( var i = page_current; i < page_current
									+ right; i++) {
								var id = (i + 1);
								$('#page' + id).removeClass('hidden');
							}
						} else {
							// FIXME: can sua cho truong hop page_show=2
							var left = (page_show) / 2;
							left = left + 1;
							var right = left - 2;
							if (page_current + right > page_count) {
								left += page_current + right - page_count;
								right -= page_current + right - page_count;
							}
							// hidden left
							for ( var i = 0; i < page_current - (left); i++) {
								$('#page' + (i + 1)).addClass('hidden');
							}
							// show left
							for ( var i = 0; i < (left - 1); i++) {
								var id = page_current - (i + 1);
								$('#page' + id).removeClass('hidden');
							}

							// hidden right;

							for ( var i = page_current + right; i < page_count; i++) {
								var id = i + 1;
								$('#page' + id).addClass('hidden');
							}
							// show right
							for ( var i = page_current; i < page_current
									+ (right); i++) {
								var id = (i + 1);
								$('#page' + id).removeClass('hidden');
							}
						}
					} else {
						// TODO: xu ly truong hop nho showpage
						// showpage < page_count;
						for ( var i = 0; i < page_show; i++) {
							$('#page' + (i + 1)).removeClass('hidden');
						}
						// showpage < page_count;
						for ( var i = page_show; i < page_count; i++) {
							$('#page' + (i + 1)).addClass('hidden');
						}
					}
				},error: function(xmlhttp) {
				   if(isAjaxSessionTimeOut(xmlhttp)) return;
				}
			});
	return false;
}

function getUserIds() {
	var lis = $('#' + list_guserslist + ' li');
	userids = [];
	for ( var i = 0; i < lis.length; i++) {
		// code
		var userid = lis[i].getAttribute('userid');
		userids.push(userid);
	}
	return userids;
}

function getUserNextpage() {
	// code
	if (page_current < page_count) {
		var page = page_current + 1;
		getUserByPage(page);
	} else {
		disableNext()
	}
	return false;
}

function getUserPrevpage() {
	// code
	if (page_current > 1) {
		var page = page_current - 1;
		getUserByPage(page);
	}
	return false;
}

function disablebtn() {
	$('#push').attr("disabled", "disabled");//
	$('#push').addClass('disabled');
	$('#back').attr("disabled", "disabled");
	$('#back').addClass('disabled');
}

function enablebtn() {
	$('#push').removeAttr("disabled");
	$('#push').removeClass('disabled');

	$('#back').removeAttr("disabled");
	$('#back').removeClass('disabled');

}

function clearflash() {
	$('#flash').html('');
}

function disableNext() {
	if (page_current >= page_count) {
		$("#linext").addClass('active');
	} else {
		$("#linext").removeClass('active');
	}
}

function getGroupId() {
	try {
		var group_id = _current_tag.replace(/\D+/, '');
		if (group_id) {
			return group_id;
		} else {
			return 0;
		}
	} catch (e) {
		console.log(e);
		return 0;
	}
}

function get_message() {
	if (flag_group) {
		return message_group;
	} else if (flag_folder) {
		return message_folder;
	}
}

function getKeyword() {
	try {
		return $('#filter').val()
	} catch (e) {
		// TODO: handle exception
		console.log(e);
		return "";
	}
}

function getCurrentPage() {
	try {
		return page_current;
	} catch (e) {
		// TODO: handle exception
		console.log(e);
		return 1;
	}
}

function get_url_by_parent() {
	if (flag_group) {
		return url_guser;
	} else if (flag_folder) {
		return url_fexecise;
	}
	return "";
}

function get_url_single() {
	if (flag_group) {
		return url_user;
	}

	if (flag_folder) {
		return url_exercise;
	}
	return "";
}

function write_success(success, select) {

	if (flag_group) {
		write_success_action(success, select, 'userId');
	} else if (flag_folder) {
		write_success_action(success, select, 'exerciseId');
	}

}

function write_success_action(success, select, key) {
	for ( var i = 0; i < success.length; i++) {
		// code
		var guser = success[i];
		g_gusers.push(guser);
		var user = _.find(select, function(item) {
			return item[key] == guser[key];
		});
		
		user.id = guser.id;
		append_html_to_guser(user);

	}
}

function write_error(error) {
	var html_error = '';
	if (flag_group) {
		html_error = '<p>Insert false with username:';
		for ( var i = 0; i < error.length; i++) {
			// TODO: lam cho phan error
			var userid = error[i].userId;
			var user = _.find(users_select, function(item) {
				return item.userId == userid;
			});
			if (i == 0) {
				// code
				html_error += user.name + ", ";
			} else {
				html_error += ", " + user.name;
			}
		}

	} else if (flag_folder) {
		// TODO:lam cho group
		html_error = '<p>Insert false with username:';
		for ( var i = 0; i < error.length; i++) {
			// TODO: lam cho phan error
			var userid = error[i].userId;
			var user = _.find(users_select, function(item) {
				return item.userId == userid;
			});
			if (i == 0) {
				// code
				html_error += user.name + ", ";
			} else {
				html_error += ", " + user.name;
			}
		}
	}

	if (error.length) {
		$('#flash').html(html_error);
	}
}

function delete_success(success_back, object_ids) {

	for ( var i = 0; i < success_back.length; i++) {
		// code
		var guser = success_back[i];
		var user = _.find(object_ids, function(item) {
			return item.id == guser.id;
		});
		var gitem = _.find(g_gusers, function(item) {
			return item.id == guser.id;
		});
		// remove fan tu da delete
		var gIndex = g_gusers.indexOf(gitem);
		g_gusers.splice(gIndex, 1);
		if (flag_group) {
			$('#g_id' + guser.id).remove();
		}
		if (flag_folder) {
			$('#f_id' + guser.id).remove();
		}
	}
}


function fixed_size_window() {
	/*var height = $(window).height() / 2;
	var scroll = {
		overflowX : 'hidden',
		overflowY : 'auto'
	};
	var pushcss = {
		marginTop : (height - 10) + 'px',
		marginBottom : 10 + 'px'
	};
	$("#" + list_guserslist).css('height', (height * 2) + 'px');
	$('#wrap-guser').css('height', (height * 2*0.8) + 'px');
	$('#wrap-user').css('height', (height*2*0.8) + 'px');

	$('#div-push').css('height', (height * 2) + 'px');
	$('#div-push').css('text-align', 'center');

	$('#push').css(pushcss);
	$('#' + list_guserslist).css('height',
			(height * 2 - height_title_h1) + 'px');
	$('#' + list_guserslist).css(scroll);
	
	$('#userslist').css('height',(height ) + 'px');
	$('#userslist').css(scroll);
	var width =  $(window).width();
	var drs_width = $('#div-right').width();
	console.log(drs_width);
	var btback = $('#back').width();
	$('#div-push').css('width', (btback+31) + 'px');*/
	//$('#wrap-guser').css('width', (drs_width-btback-32) + 'px');
	var middle =	$(window).height()*.8/2 - 32;
	var height  = $(window).height()*.8 - 39;
	var pushcss = {
			marginTop :middle+'px',
			marginBottom : 10 + 'px',
		};
	$('#push').css(pushcss);
	var scroll = {
			overflowX : 'hidden',
			overflowY : 'auto'
		};
	$('#div-push').css('textAlign','center');
	$('#' + list_guserslist).css('height',
			(height  - height_title_h1) + 'px');
	
	$('#userslist').css('height',
			(height  -125) + 'px');
	$('#'+'wrap-user').css('height',(height  ) + 'px');
	$('#' + list_guserslist).css(scroll);
	$('#userslist').css(scroll);
}

$('#dialog-panel').r