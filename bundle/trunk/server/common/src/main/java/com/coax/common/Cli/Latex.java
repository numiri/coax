package com.coax.common.Cli;

/**
 * lưu trữ thông tin của symbol từ client gửi lên.
 * 
 * @author phamvan. Created Dec 3, 2011.
 */
class Latex implements Comparable<Latex> {
	private int id;
	private String content;
	private String symbol;
	private int index = 0;
	private String coordinates;

	/**
	 * lưu thông tin latex được lấy ra từ xml.
	 * 
	 * @param id
	 *            id của symbol được lấy ra từ xml.
	 * @param content
	 *            latex được gửi kèm xml.
	 * @param symbol
	 *            giá trị của symbol trong xml.
	 */
	public Latex(int id, String content, String symbol) {
		super();
		this.id = id;
		this.content = content;
		this.symbol = symbol;
	}

	/**
	 * 
	 * @return lấy chỉ số tọa độ của symbol trong file bst.
	 */
	public int getIndex() {
		return this.index;
	}

	/**
	 * @param index
	 *            chi số tọa độ<32,3><34,3> của symbol trong file bst.
	 */
	public void setIndex(int index) {
		this.index = index;
	}

	/**
	 * 
	 * 
	 * @return tọa độ của symbol.
	 */
	public String getCoordinates() {
		return this.coordinates;
	}

	/**
	 * 
	 * 
	 * @param coordinates tọa độ của symbol.
	 *           
	 */
	public void setCoordinates(String coordinates) {
		this.coordinates = coordinates;
	}

	
	/**
	 * @return giá trị của symbol.
	 */
	public String getSymbol() {
		return this.symbol;
	}

	/**
	 * @param symbol giá trị của symbol.
	 */
	@SuppressWarnings("javadoc")
	public void setSymbol(String symbol) {
		this.symbol = symbol;
	}

	/**
	 * @return id của symbol.
	 */
	@SuppressWarnings("javadoc")
	public int getId() {
		return this.id;
	}

	/**
	 * @param id id của symbol.
	 */
	@SuppressWarnings("javadoc")
	public void setId(int id) {
		this.id = id;
	}

	/**
	 * @return latex của biểu thức được gửi lên.
	 */
	@SuppressWarnings("javadoc")
	public String getContent() {
		return this.content;
	}

	/**
	 * @param content latex của biểu thức được gửi lên.
	 */
	@SuppressWarnings("javadoc")
	public void setContent(String content) {
		this.content = content;
	}

	/* (non-Javadoc)
	 * @see java.lang.Comparable#compareTo(java.lang.Object)
	 */
	public int compareTo(Latex seek) {
		return this.index - seek.index;
	}

	@Override
	public String toString() {
		// TODO Auto-generated method stub.
		return this.symbol + "\t" + this.id + "\t" + this.content + "\t"
				+ this.index + "\t" + this.coordinates;
	}
}
