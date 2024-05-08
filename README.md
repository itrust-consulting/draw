# Draw (Dependencies for a Risk Analysis on a WhiteBoard) 
## Introduction
___
The DRAW is an open source tool by itrust consulting and is used to represent assets and their corresponding dependencies in a graphical manner. The assets are represented as nodes in the graph and the dependency is represented as an edge from one asset to another. The asset carries information of the name of the asset and its type example the asset may be a Financial, Business process etc. The edge carries the dependency information and also the probability information. Probability implies the chances that an asset impacts the other asset.

The representation of asset dependencies enable the users to graphically view the impact an asset 
has on other assets. As an example if there is an edge between Server to Server Data it implies that a problem at Server might cause a problem with Server Data. 

The dependency graph created by DRAW can also be synchronised with Trick Service Risk Analysis Tool  by itrust consulting, enabling the user to perform a more effective risk analysis based on asset dependency and probability propagation associated with edges.

Staring version `v2.0.5` onwards the tool also supports excel format for importing and exporting dependencies into the DRAW whiteboard.  

## Documentation
___

Refer [User Guide](documentation/index.html)

## Demo
___

For hosted website of the tool refer: (https://draw.trickservice.com/)

## Contributing
___

Feel free to fork the code, play with it, make updates and send us the pull requests.
There is one main branch called master branch which is stable.
Features are developed in separated branches and then regularly merged into the stable master branch.

## License
___

This software is licensed under [Apache License Version 2.0, January 2004](http://www.apache.org/licenses/)

- Copyright (C) itrust consulting 
- Copyright (C) 2018-2019 Steve Muller
- Copyright (C) Bootstrap v4.6.2 https://github.com/twbs/bootstrap/blob/master/LICENSE
- Copyright (C) Font Awesome 4.7.0  http://fontawesome.io/license
- Copyright (C) cytoscape-3.2.5 https://cytoscape.org 
- Copyright (C) cytoscale-edgehandles-2.13.2 https://cytoscape.org 
- Copyright (C) jQuery v3.2.1 https://jquery.org/license
- Copyright (C) Lodash  https://lodash.com/license
- Copyright (C) popper-1.11.0 http://opensource.org/licenses/MIT
- Copyright (C) RequireJS 2.3.5  https://github.com/requirejs/requirejs/blob/master/LICENSE
- Copyright (C) xlsx.js (C) 2013-present http://sheetjs.com
___

                        

