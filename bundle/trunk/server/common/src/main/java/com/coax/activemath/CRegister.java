/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.activemath;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.activemath.webapp.user.*;
import org.activemath.webapp.user.account.AccountManager;
/**
 *
 * @author phuctq
 */
public class CRegister {
    private String fullName = "";
    private String userId = "";
    private String password = "";
    private String password2 = "";
    private String language = "en";
    private String stereotype = "";
    private String educationallevel = "";
    private String email = "";
    private String groups = "";
    private String err = "";
    public CRegister(){
        fullName = "";
        userId = "";
        password = "";
        password2 = "";
        language = "en";
        stereotype = "";
        educationallevel = "";
        email = "";
        groups = "";
        err = "";
    }
    /**
     * @return the fullName
     */
    public String getFullName() {
        return fullName;
    }

    /**
     * @param fullName the fullName to set
     */
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    /**
     * @return the userId
     */
    public String getUserId() {
        return userId;
    }

    /**
     * @param userId the userId to set
     */
    public void setUserId(String userId) {
        this.userId = userId;
    }

    /**
     * @return the password
     */
    public String getPassword() {
        return password;
    }

    /**
     * @param password the password to set
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * @return the password2
     */
    public String getPassword2() {
        return password2;
    }

    /**
     * @param password2 the password2 to set
     */
    public void setPassword2(String password2) {
        this.password2 = password2;
    }

    /**
     * @return the language
     */
    public String getLanguage() {
        return language;
    }

    /**
     * @param language the language to set
     */
    public void setLanguage(String language) {
        this.language = language;
    }

    /**
     * @return the stereotype
     */
    public String getStereotype() {
        return stereotype;
    }

    /**
     * @param stereotype the stereotype to set
     */
    public void setStereotype(String stereotype) {
        this.stereotype = stereotype;
    }

    /**
     * @return the educationallevel
     */
    public String getEducationallevel() {
        return educationallevel;
    }

    /**
     * @param educationallevel the educationallevel to set
     */
    public void setEducationallevel(String educationallevel) {
        this.educationallevel = educationallevel;
    }

    /**
     * @return the email
     */
    public String getEmail() {
        return email;
    }

    /**
     * @param email the email to set
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * @return the groups
     */
    public String getGroups() {
        return groups;
    }

    /**
     * @param groups the groups to set
     */
    public void setGroups(String groups) {
        this.groups = groups;
    }
    
    public boolean Action(){
        boolean bBool = false;
        AccountManager accountManager = AccountManager.getInstance();
        if(accountManager.accountExists(userId)){
            this.err = "this username already exists";
            return bBool;
        }
        if(this.userId.length() < 4){
            this.err = "User name must be at least 4 characters long.";
            return bBool;
        }
        if(this.password.length()<4){
            this.err = "Password must be at least 4 characters long";
            return bBool;
        }
        
        try {
            accountManager.createAccount(userId, password);
        } catch (UsernameTakenException ex) {
            
        }
         // Create and Populate the new User object
        User newUser = new User(this.userId);
        if(!this.fullName.equals("")){            
            newUser.setName(fullName);
        }
        else{
            newUser.setName(this.userId);
        }
        newUser.setFullName(fullName);
        newUser.setLanguage(this.language);
        newUser.setStereotype(this.stereotype);
        newUser.setEducationalLevel(this.educationallevel);
        newUser.setEmail(this.email);
        UserData userData = newUser.getUserData();
        UserManager userManager = UserManager.getInstance();
        try {
            userManager.registerNewUser(newUser);
            bBool = true;
            this.err = "";
        } catch (UserManagerException ex) {
            
        }
        return bBool;
    }

    /**
     * @return the err
     */
    public String getErr() {
        return err;
    }

    /**
     * @param err the err to set
     */
    public void setErr(String err) {
        this.err = err;
    }
}
