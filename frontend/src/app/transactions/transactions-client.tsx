"use client";

import {useCallback,useEffect,useMemo,useState,type FormEvent} from "react";
import styles from "./transactions.module.css";

type Kind="INCOME"|"EXPENSE";
type Transaction={id:string;kind:Kind;amount:string;category:string;description:string|null;occurredOn:string};
type Category={id:string|null;kind:Kind;name:string};
type Categories={INCOME:Category[];EXPENSE:Category[]};
type Summary={month:string;income:string;expenses:string;net:string;byCategory:{category:string;amount:string}[];monthly:{month:string;income:string;expenses:string}[]};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
const money=(s:string|number)=>new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(Number(s));
const blank=()=>({kind:"EXPENSE" as Kind,amount:"",category:"",description:"",occurredOn:today()});
async function api<T>(url:string,init?:RequestInit):Promise<T>{const res=await fetch(url,{cache:"no-store",...init});if(!res.ok){const data=await res.json().catch(()=>null);throw new Error(data?.error??`Request failed (${res.status}).`);}return res.status===204?undefined as T:await res.json() as T;}
const json=(method:string,data:object):RequestInit=>({method,headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
export default function TransactionsClient(){
 const [month,setMonth]=useState(()=>today().slice(0,7));
 const [typeFilter,setTypeFilter]=useState<"ALL"|Kind>("ALL");
 const [categoryFilter,setCategoryFilter]=useState("");
 const [rows,setRows]=useState<Transaction[]>([]);
 const [categories,setCategories]=useState<Categories>({INCOME:[],EXPENSE:[]});
 const [summary,setSummary]=useState<Summary|null>(null);
 const [form,setForm]=useState(blank);
 const [editing,setEditing]=useState<string|null>(null);
 const [categoryKind,setCategoryKind]=useState<Kind>("EXPENSE");
 const [newCategory,setNewCategory]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{
  const params=new URLSearchParams({month});
  if(typeFilter!=="ALL")params.set("kind",typeFilter);
  if(categoryFilter)params.set("category",categoryFilter);
  const [list,cat,sums]=await Promise.all([api<Transaction[]>(`/api/transactions?${params}`),api<Categories>("/api/transaction-categories"),api<Summary>(`/api/transactions/summary?month=${month}`)]);
  setRows(list);setCategories(cat);setSummary(sums);
 },[month,typeFilter,categoryFilter]);
 useEffect(()=>{let valid=true;void (async()=>{try{await refresh();if(valid)setError("");}catch(e){if(valid)setError(e instanceof Error?e.message:"Could not load transactions.");}finally{if(valid)setLoading(false);}})();return()=>{valid=false;};},[refresh]);
 const choices=categories[form.kind];
 const filterChoices=useMemo(()=>[...new Set([...categories.INCOME,...categories.EXPENSE].map(c=>c.name))].sort(),[categories]);
 async function submit(event:FormEvent){event.preventDefault();setError("");setBusy(true);try{
  if(!/^\d+(?:\.\d{1,2})?$/.test(form.amount))throw Error("Enter a valid amount with at most two decimal places.");
  const [whole,decimal=""]=form.amount.split(".");
  const amount=`${whole}.${decimal.padEnd(2,"0")}`;
  const body={...form,amount,description:form.description.trim()||null};
  await api(editing?`/api/transactions/${editing}`:"/api/transactions",json(editing?"PATCH":"POST",body));
  setEditing(null);setForm(blank());await refresh();
 }catch(e){setError(e instanceof Error?e.message:"Could not save transaction.");}finally{setBusy(false);}}
 async function remove(id:string){if(!window.confirm("Delete this transaction permanently?"))return;setBusy(true);setError("");try{await api<void>(`/api/transactions/${id}`,{method:"DELETE"});await refresh();}catch(e){setError(e instanceof Error?e.message:"Could not delete transaction.");}finally{setBusy(false);}}
 function edit(row:Transaction){setEditing(row.id);setForm({kind:row.kind,amount:row.amount,category:row.category,description:row.description??"",occurredOn:row.occurredOn});window.scrollTo({top:0,behavior:"smooth"});}
 async function addCategory(event:FormEvent){event.preventDefault();setBusy(true);setError("");try{await api("/api/transaction-categories",json("POST",{kind:categoryKind,name:newCategory.trim()}));setNewCategory("");await refresh();}catch(e){setError(e instanceof Error?e.message:"Could not add category.");}finally{setBusy(false);}}
 async function deleteCategory(item:Category){if(!item.id||!window.confirm(`Delete category "${item.name}"?`))return;setBusy(true);setError("");try{await api<void>(`/api/transaction-categories/${item.id}`,{method:"DELETE"});await refresh();}catch(e){setError(e instanceof Error?e.message:"Could not delete category.");}finally{setBusy(false);}}
 const maxMonthly=Math.max(1,...(summary?.monthly??[]).flatMap(m=>[Number(m.income),Number(m.expenses)]));
 const maxCategory=Math.max(1,...(summary?.byCategory??[]).map(c=>Number(c.amount)));
 return <div className={styles.root}>
  {error&&<p className={styles.error} role="alert">{error}</p>}
  <section className={styles.stats} aria-label="Monthly financial totals">
   <div className={styles.stat}><span>Income</span><strong>{money(summary?.income??"0")}</strong></div>
   <div className={styles.stat}><span>Expenses</span><strong>{money(summary?.expenses??"0")}</strong></div>
   <div className={styles.stat}><span>Net cash flow</span><strong>{money(summary?.net??"0")}</strong></div>
  </section>
  <section className={styles.panel} aria-labelledby="transaction-form-title"><h2 id="transaction-form-title">{editing?"Edit transaction":"Add a transaction"}</h2>
   <form onSubmit={submit} className={styles.form}>
    <label>Type<select value={form.kind} onChange={e=>setForm(f=>({...f,kind:e.target.value as Kind,category:""}))}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></label>
    <label>Amount (CAD)<input type="number" inputMode="decimal" min="0.01" max="9999999999.99" step="0.01" required value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></label>
    <label>Category<select required value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option value="">Select category</option>{choices.map(c=><option key={`${c.kind}-${c.name}`} value={c.name}>{c.name}</option>)}</select></label>
    <label>Date<input required type="date" value={form.occurredOn} onChange={e=>setForm(f=>({...f,occurredOn:e.target.value}))}/></label>
    <label className={styles.wide}>Description (optional)<input maxLength={500} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Weekly groceries"/></label>
    <div className={styles.actions}><button disabled={busy} type="submit">{editing?"Save changes":"Add transaction"}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm(blank());}}>Cancel edit</button>}</div>
   </form>
  </section>
  <section className={styles.panel} aria-labelledby="history-title"><div className={styles.heading}><h2 id="history-title">Transaction history</h2><div className={styles.filters}><label>Month <input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><label>Type <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as "ALL"|Kind)}><option value="ALL">All</option><option value="INCOME">Income</option><option value="EXPENSE">Expenses</option></select></label><label>Category <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="">All categories</option>{filterChoices.map(c=><option key={c} value={c}>{c}</option>)}</select></label></div></div>
   <div className={styles.scroll}><table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{rows.map(t=><tr key={t.id}><td>{t.occurredOn}</td><td>{t.kind==="INCOME"?"Income":"Expense"}</td><td>{t.category}</td><td>{t.description??"—"}</td><td className={t.kind==="INCOME"?styles.positive:undefined}>{t.kind==="INCOME"?"+":"−"}{money(t.amount)}</td><td><div className={styles.actions}><button type="button" disabled={busy} onClick={()=>edit(t)}>Edit</button><button type="button" disabled={busy} onClick={()=>void remove(t.id)}>Delete</button></div></td></tr>)}</tbody></table></div>
   {loading?<p>Loading transactions…</p>:rows.length===0?<p>No transactions match these filters.</p>:null}
  </section>
  <section className={styles.charts} aria-label="Spending charts"><div className={styles.panel}><h2>Six-month trends</h2><p className={styles.note}>Income and expenses (CAD)</p><div className={styles.monthChart}>{(summary?.monthly??[]).map(m=><div key={m.month} className={styles.monthGroup}><div className={styles.barPair}><div className={styles.incomeBar} role="img" aria-label={`${m.month} income ${money(m.income)}`} style={{height:`${Math.max(2,Number(m.income)/maxMonthly*100)}%`}}/><div className={styles.expenseBar} role="img" aria-label={`${m.month} expenses ${money(m.expenses)}`} style={{height:`${Math.max(2,Number(m.expenses)/maxMonthly*100)}%`}}/></div><span>{m.month.slice(5)}</span></div>)}</div><p className={styles.note}><span className={styles.incomeDot}/> Income　<span className={styles.expenseDot}/> Expenses</p></div>
  <div className={styles.panel}><h2>Spending by category</h2><p className={styles.note}>Selected month · CAD</p>{(summary?.byCategory??[]).length===0?<p>No expenses this month.</p>:(summary?.byCategory??[]).map(c=><div className={styles.categoryBar} key={c.category}><div className={styles.categoryTitle}><span>{c.category}</span><b>{money(c.amount)}</b></div><div className={styles.track}><div style={{width:`${Number(c.amount)/maxCategory*100}%`}}/></div></div>)}</div></section>
  <section className={styles.panel}><h2>Custom categories</h2><form onSubmit={addCategory} className={styles.form}><label>Type<select value={categoryKind} onChange={e=>setCategoryKind(e.target.value as Kind)}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></label><label>Category name<input required maxLength={80} value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="e.g. Pets"/></label><div className={styles.actions}><button disabled={busy} type="submit">Create category</button></div></form><div className={styles.chips}>{categories[categoryKind].filter(c=>c.id).map(c=><span key={c.id} className={styles.chip}>{c.name}<button disabled={busy} onClick={()=>void deleteCategory(c)} aria-label={`Delete ${c.name}`}>×</button></span>)}</div><p className={styles.note}>Built-in categories cannot be deleted. Custom categories in use must be reassigned before removal.</p></section>
 </div>;
}
