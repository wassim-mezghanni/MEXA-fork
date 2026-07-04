import pandas as pd
for file, label in [('/Users/wassim/MEXA-fork/flores_table1_100_mixtral_8x7b_results.csv', 'flores-table1'), ('/Users/wassim/MEXA-fork/flores_table1_2000_mixtral_8x7b_results.csv', 'flores-table1-2000'), ('/Users/wassim/MEXA-fork/bible_table1_mixtral_8x7b_results.csv', 'bible-table1')]:
  df = pd.read_csv(file)
  print(label, "max:", round(df['mistralai/Mixtral-8x7B-v0.1_max'].mean(), 4))
  print(label, "mean:", round(df['mistralai/Mixtral-8x7B-v0.1_mean'].mean(), 4))
