/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.activemath;

import java.util.ArrayList;
import java.util.List;
import org.activemath.content.Book;
import org.activemath.content.ContentManager;
import org.activemath.content.Page;
import org.activemath.content.TocEntry;
import org.activemath.content.items.Item;
import org.activemath.webapp.i18n.Localizer;
import org.activemath.webapp.user.BookState;
import org.activemath.webapp.user.User;

/**
 *
 * @author phuctq
 */

public class CViewBook {
    private int pageNum = 1;
    private String bookId = "";
    Localizer localizer = Localizer.getInstance();
    private Book mbook = null;
    public CViewBook(){
        this.mbook = null;
        pageNum = 1;
        bookId = "";
    }

    /**
     * @return the pageNum
     */
    public int getPageNum() {
        return pageNum;
    }

    /**
     * @param pageNum the pageNum to set
     */
    public void setPageNum(int pageNum) {
        this.pageNum = pageNum;
    }

    /**
     * @return the bookId
     */
    public String getBookId() {
        return bookId;
    }

    /**
     * @param bookId the bookId to set
     */
    public void setBookId(String bookId) {
        this.bookId = bookId;
    }
    
    public Page Action(User user){
        Book book = null;// user.getBook(this.bookId);
        if(this.getMbook() == null)
            book = user.getBook(this.bookId);
        else
            book = this.getMbook();
        if(book == null)
            return null;
        BookState state = user.getBookState(bookId);
        Page page = book.getPage(pageNum);
        return page;
    }
    
    private String textTitle(TocEntry entry,String lang){
        String locTitle = entry.getTitle(lang, localizer.getDefaultLanguage()); // in user's language
        org.activemath.presentation.Formatter textFormatter = new org.activemath.presentation.Formatter("text", lang);
        String textTitle = textFormatter.formatTitle(locTitle) ;        
        return textTitle;
    }
    
    private ExerciseItem getItem(TocEntry entry,String lang){
        ExerciseItem item = new ExerciseItem();
        item.setLeaf(entry.isLeaf());
        item.setTitle(textTitle(entry,lang));
        item.setPageNum(entry.getPageId());
        item.setSection(entry.getId());
        String url = "";
        url = "book=" + entry.getBookId()+"&section=" + entry.getId();
        if(entry.isLeaf()){
            url = url + "&page=" + entry.getPageId();
        }
        item.setUrl(url);
        return item;
    }
    
    public List<ExerciseItem> getRepose(User  user){
        List<ExerciseItem> list = new ArrayList<ExerciseItem>();
        Book book = user.getBook(this.bookId);        
        this.setMbook(book);
        BookState state = user.getBookState(this.bookId);
        List<TocEntry> tocsEntry = book.getToc().getChildren();
        String lang = user.getLanguage();
        int i = 0, j = 0,m =0,n =0,k =0;
        for(i = 0;i< tocsEntry.size();i++){
            TocEntry entry = tocsEntry.get(i);
            list.add(this.getItem(entry,lang));            
            if(!entry.isLeaf()){
                //level 1                
                List <TocEntry> children = entry.getChildren();
                for(j= 0;j< children.size();j++){
                   TocEntry chil = children.get(j);
                   list.add(this.getItem(chil,lang));
                   if(!chil.isLeaf()){
                       //level 2
                       List <TocEntry> children2 = chil.getChildren();
                       for(k = 0;k < children2.size();k++){
                           TocEntry chil2 = children2.get(k);
                           list.add(this.getItem(chil2,lang));
                           if(!chil2.isLeaf()){
                               //level 3
                               List <TocEntry> children3 = chil2.getChildren();
                               for(m = 0;m < children3.size();m++){
                                   TocEntry chil3 = children3.get(k);
                                   list.add(this.getItem(chil3,lang));
                                   if(!chil3.isLeaf()){
                                       //level 4
                                       List <TocEntry> children4 = chil3.getChildren();
                                       for(n = 0;n < children4.size();n++){
                                           TocEntry chil4 = children4.get(k);
                                           list.add(this.getItem(chil4,lang));
                                           if(!chil4.isLeaf()){
                                               //level 5
                                               List <TocEntry> children5 = chil4.getChildren();
                                               for(int mk =0;mk<children5.size();mk++){
                                                   TocEntry chil5 = children5.get(k);
                                                   list.add(this.getItem(chil5,lang));
                                               }//end for level5
                                           }//end if level 4
                                       }//end for level 4
                                   }//end if level 3
                               }//end for level 3    
                           }//end if level 2
                       }//end for level 2
                   }//end if level 1
                }//end for level 1
            }//end if level 0
        }//end for level 0
        return list;
    }
    
    public void Printf(List<ExerciseItem> list){
        for(int i =0;i<list.size();i++){
            ExerciseItem item = list.get(i);
            item.toString();
        }
    }
    
    public List<CItem> getItemRepose(User user){
        List<CItem> list = new  ArrayList<CItem>();
        Book book = null;// user.getBook(this.bookId);
        if(this.getMbook() == null)
            book = user.getBook(this.bookId);
        else
            book = this.getMbook();
        if(book == null)
            return list;
        BookState state = user.getBookState(bookId);
        Page page = book.getPage(pageNum);
        List<String> items = page.getItemIds();
        for(int k =0;k < items.size();k++){
            String mItem = items.get(k);
            System.out.println("Items page  " + mItem);
            Item item = ContentManager.getInstance().getContentItem(mItem);
            if(item != null){
                System.out.println("Items page Title  " + item.getTitle() + " getId  " + item.getId());
                CItem it = new CItem();
                it.setId(item.getId());
                it.setTitle(item.getTitle());
                list.add(it);
            }
        }//end for items
        return list;
    }
    /**
     * @return the mbook
     */
    public Book getMbook() {
        return mbook;
    }

    /**
     * @param mbook the mbook to set
     */
    private void setMbook(Book mbook) {
        this.mbook = mbook;
    }
}
