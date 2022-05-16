import * as React from 'react';
//import { ethers } from "ethers";
import './App.css';

import { getBaseLayoutComponent } from '../../../utils/base-layout';
import { getComponent } from '../../components-registry';

export default function PageLayout(props) {
    const { page, site } = props;
    const BaseLayout = getBaseLayoutComponent(page.baseLayout, site.baseLayout);
    const sections = page.sections || [];

  const [currentAccount, setCurrentAccount] = useState("");  
  const [totalWaves, setTotalWaves] = useState("");
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);  
  const contractAddress = "0x47Fef799FBDE0d0455522CBfbE9DC0e75760768F";  
  const contractABI = abi.abi;


  const getAllWaves = async () => {
      try {      
      if (document)            const { ethereum } = window;
      if (ethereum) {        
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();        

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log("Objeto Ethereum não existe!")
      }
    } catch (error) {        
      console.log(error);
    }
  }

  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Certifique-se de que o Metamask está instalado e você está usando a rede Rinkebt!");
        return;
      } else {
        
      console.log("Temos um objeto Etherum", ethereum);        
      getAllWaves();        
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Conta autorizada encontrada:", account); 
        setCurrentAccount(account)
      } else {
        console.log("Nenhuma conta autorizada encontrada")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implemente aqui o seu método connectWallet
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("MetaMask não encontrada!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;      

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Total de foguetes enviados ao espaço...", count.toNumber());        

        const waveTxn = await wavePortalContract.wave(message, { gasLimit:300000 });
        console.log("Mineração..", waveTxn.hash);

        await waveTxn.wait();
        console.log("Minerando -- ", waveTxn.hash);

        setMessage('');

        count = await wavePortalContract.getTotalWaves();
        console.log("Total de foguetes enviados..", count.toNumber());        
      } else {
        console.log("Objeto Ethereum não encontrado!");
      }
    } catch (error) {
      console.log(error)
    }
}
  

  useEffect(() => {
    checkIfWalletIsConnected();  
  }, [])



    return (
        <BaseLayout page={page} site={site}>
            <main id="main" className="sb-layout sb-page-layout">
                {page.title && (
                    <h1 className="sr-only" data-sb-field-path="title">
                        {page.title}
                    </h1>
                )}


    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Oi, eu sou um contrato inteligente!
        </div>
        </div>
        </div>
{/* 
                {sections.length > 0 && (
                    <div data-sb-field-path="sections">
                        {sections.map((section, index) => {
                            const Component = getComponent(section.type);
                            if (!Component) {
                                throw new Error(`no component matching the page section's type: ${section.type}`);
                            }
                            return <Component key={index} {...section} data-sb-field-path={`sections.${index}`} />;
                        })}
                    </div>
                )} */}
            </main>
        </BaseLayout>
    );
}
