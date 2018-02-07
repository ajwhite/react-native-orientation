var React = require('react')
var Component = require('react-native');
var Orientation = require('./orientation')

/**
 * Provide a component with an orientation prop.
 * 
 * ```
 * const MyComponent = props => <Text>Orientation: {props.orientation}</Text>
 * 
 * const MyComponentWithOrientation = withOrientation(MyComponent)
 * 
 * <MyComponentWithOrientation />
 * // Outputs: <Text>Orientation: LANDSCAPE</Text>
 * ```
 */
function withOrientation (ComponentWithOrientation) {
  class OrientationProvier extends React.Component {
    state = {
      orientation: Orientation.getInitialOrientation()
    };

    constructor(props) {
      super(props);
      this.onOrientationChanged = this.onOrientationChanged.bind(this);
    }

    componentDidMount() {
      Orientation.addEventListener(this.onOrientationChanged);
    }

    componentWillUnmount() {
      Orientation.removeEventListener(this.onOrientationChanged);
    }

    onOrientationChanged(orientation) {
      this.setState({orientation});
    }

    render() {
      return <ComponentWithOrientation {...this.props} orientation={this.state.orientation} />
    }
  }
}

/**
 * Creates a higher order component 
 * @param {*} orientationProps 
 */
function withOrientationProps (...orientationProps) {
  return ComponentWithOrientationProps => withOrientation(({orientation, ...props}) => {
    return (
      <ComponentWithOrientationProps 
        {...props} 
        {...evaluateOrientationProps(orientation, orientationProps, props)} 
      />
    );
  });
}

function withLandscapeProps (...orientationProps) {
  const wrappedLandscapeProps = wrapOrientationSpecificProps(orientationProps, landscapeProps);

  return ComponentWithLandscapeProps => withOrientation(({orientation, ...props}) => {
    return (
      <ComponentWithLandscapeProps
        {...props}
        {...evaluateOrientationProps(orientation, wrappedLandscapeProps, props)}
      />
    )
  })
}


function withPortraitProps (...orientationProps) {
  const wrappedPortraitProps = wrapOrientationSpecificProps(orientationProps, portraitProps);

  return ComponentWithPortraitProps => withOrientation(({orientation, ...props}) => {
    return (
      <ComponentWithPortraitProps
        {...props}
        {...evaluateOrientationProps(orientation, wrappedPortraitProps, props)}
      />
    )
  })
}

function landscapeProps (orientationProps) {
  const callableOrientationProps = isFunction(orientationProps) ? orientationProps : () => orientationProps;
  return (orientation, props) => isLandscape(orientation) ? callableOrientationProps({orientation, ...props}) : null;
}

function portraitProps (orinetationProps) {
  return orientation => isPortrait(orientation) ? orientationProps : null;
}

function evaluateOrientationProps (orientation, orientationProps, componentProps) {
  return Object.keys(orientationProps).reduce((map, prop) => {
    if (typeof prop === 'function') {
      let evaluatedProps = prop(orientation, componentProps);
      if (typeof evaluatedProps === 'object') {
        return {...map, ...evaluatedProps};
      }
    } else if (typeof prop === 'object') {
      return {...map, ...prop};
    }
    return map;
  });
}

function wrapOrientationSpecificProps (props, orientationPropFunc) {
  return props.reduce((wrappedProps, prop) => {
    if (typeof prop === 'function') {
      wrappedProps.push(prop)
    } else if (typeof prop === 'object') {
      wrappedProps.push(orientationPropFunc(prop))
    }
    return wrappedProps;
  }, []);
}