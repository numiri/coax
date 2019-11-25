package com.coax.common.Cli;

/**
 * TODO lưu trữ thông tin của biểu thức trước..
 * 
 * @author phamvan. Created Nov 21, 2011.
 */
 class PreLatex {
	@SuppressWarnings("javadoc")
	private String Latex;
	@SuppressWarnings("javadoc")
	private String Variable;
	private int Resutl;
	boolean hasEqual;
	boolean hasAnyEqual;

	/**
	 * @return true nếu có dấu so sánh, ngược lại false.
	 */
	public boolean isHasAnyEqual() {
		return hasAnyEqual;
	}

	/**
	 * @param hasAnyEqual
	 *            true nếu có dấu so sánh, ngược lại false.
	 */
	public void setHasAnyEqual(boolean hasAnyEqual) {
		this.hasAnyEqual = hasAnyEqual;
	}

	/**
	 * @return true nếu có dấu bằng, ngược lại false.
	 */
	public boolean isHasEqual() {
		return hasEqual;
	}

	/**
	 * @param hasEqual
	 *            kiểm tra dấu bằng.
	 */
	public void setHasEqual(boolean hasEqual) {
		this.hasEqual = hasEqual;
	}

	/**
	 * 
	 * @return Returns kết quả so sánh của maxima.
	 */
	public int getResutl() {
		return this.Resutl;
	}

	/**
	 * 
	 * 
	 * @param resutl
	 *            kết quả so sánh của maxima.
	 */
	public void setResutl(int resutl) {
		this.Resutl = resutl;
	}

	/**
	 * lưu trữ thông tin được lấy ra từ xml client gửi lên.
	 * 
	 * @param latex
	 *            latex biểu thức trước đó.
	 * @param variable
	 *            biến của biểu thức trước đó.
	 */
	public PreLatex(String latex, String variable) {
		super();
		this.Latex = latex;
		this.Variable = variable;
	}

	/**
	 * 
	 * @return Returns latex của biểu thức trước đó..
	 */
	public String getLatex() {
		return this.Latex;
	}

	/**
	 * 
	 * @param latex
	 *            latex của biểu thức trước đó.
	 */
	public void setLatex(String latex) {
		this.Latex = latex;
	}

	/**
	 * lưu trữ thông tin được lấy ra từ xml client gửi lên.
	 * 
	 * @param latex
	 *            latex biểu thức trước đó.
	 * @param variable
	 *            latex biểu thức trước đó.
	 * @param hasEqual
	 *            kiểm tra latex có dấu bằng hay không.
	 * @param hasAnyEqual
	 *            kiểm tra latex có dấu > < = hay không.
	 **/
	public PreLatex(String latex, String variable, boolean hasEqual,
			boolean hasAnyEqual) {
		super();
		Latex = latex;
		Variable = variable;
		this.hasEqual = hasEqual;
		this.hasAnyEqual = hasAnyEqual;
	}

	/**
	 * 
	 * 
	 * @return biến của biểu thức.
	 */
	public String getVariable() {
		return this.Variable;
	}

	/**
	 * 
	 * @param variable
	 *            biến của biểu thức.
	 */
	public void setVariable(String variable) {
		this.Variable = variable;
	}
}
