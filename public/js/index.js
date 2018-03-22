$(function () {

    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $('#userInfo');

    //注册页面
    $loginBox.find('a.colMint').on('click', function () {
        $registerBox.show();
        $loginBox.hide();
    });

    //登录页面
    $registerBox.find('a.colMint').on('click', function () {
        $loginBox.show();
        $registerBox.hide();
    });

    //提交注册
    $registerBox.find('button').on('click', function () {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registerBox.find('[name="username"]').val(),
                password: $registerBox.find('[name="password"]').val(),
                repassword: $registerBox.find('[name="repassword"]').val(),
            },
            dataType: 'json',
            success: function (result) {

                $registerBox.find('.textCenter').html(result.message);

                if (!result.code) {
                    setTimeout(function () {
                        $loginBox.show();
                        $registerBox.hide();
                    }, 1000);
                }
            }
        })
    });

    //登陆
    $loginBox.find('button').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val(),
            },
            dataType: 'json',
            success: function (result) {
                $loginBox.find('.textCenter').html(result.message);

                if (!result.code) {
                    window.location.reload();
                }
            }
        })

    });

    $('#logout').on('click', function () {
        $.ajax({
            type: 'get',
            url: '/api/user/logout',
            success: function (result) {

                if (!result.code) {
                    window.location.reload();
                }
            }
        })

    });

});