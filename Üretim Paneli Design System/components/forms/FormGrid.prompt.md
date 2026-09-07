One-line: the two-column grid every data-entry form uses; wrap each control in a `Field`.

```jsx
<FormGrid columns={2}>
  <Field label="Tarih"><TextInput type="date" /></Field>
  <Field label="Vardiya"><Select options={["Vardiya 1","Vardiya 2"]} /></Field>
  <Field label="Not" span={2}><TextInput /></Field>
</FormGrid>
```
