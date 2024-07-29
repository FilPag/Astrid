declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.txt' {
  const value: string;
  export default value;
}

declare module '*.module.scss' {
  const styles: { [className: string]: string };
  export default styles;
}
