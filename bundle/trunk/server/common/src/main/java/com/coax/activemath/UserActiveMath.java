/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.activemath;

import com.coax.common.Cli.Utils;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.activemath.webapp.user.UsernameTakenException;
import org.activemath.webapp.user.account.AccountManager;

/**
 *
 * @author cz
 */
public class UserActiveMath {

    /**
     *
     * @param username
     * @param password
     * @return
     */
    public static boolean Create(String username, String password) {
        Utils.InitActiveMath();
        AccountManager am = AccountManager.getInstance();
        if (am.accountExists(username)) {
            return false;
        } else {
            try {
                am.createAccount(username, password);
                return true;

            } catch (UsernameTakenException ex) {

                Logger.getLogger(UserActiveMath.class.getName()).log(Level.SEVERE, null, ex);
                return false;
            }
        }
    }
}
