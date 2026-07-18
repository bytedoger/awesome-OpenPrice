import multiprocessing
import time
from production_worker import run_production_worker
from test_worker import run_test_worker

def main():
    print("Starting OpenPrice Scraper...")
    print("Launching Production Worker and Test Worker concurrently...")
    
    prod_process = multiprocessing.Process(target=run_production_worker, name="ProductionWorker")
    test_process = multiprocessing.Process(target=run_test_worker, name="TestWorker")
    
    prod_process.start()
    test_process.start()
    
    try:
        # Keep the main process alive while workers are running
        while True:
            time.sleep(1)
            # If either process dies unexpectedly, you could potentially restart it here,
            # but for now we just keep the main thread alive.
            if not prod_process.is_alive() or not test_process.is_alive():
                print("One of the workers stopped. Exiting main process...")
                break
                
    except KeyboardInterrupt:
        print("\nReceived termination signal. Stopping workers...")
        
    finally:
        if prod_process.is_alive():
            prod_process.terminate()
            prod_process.join()
        if test_process.is_alive():
            test_process.terminate()
            test_process.join()
        print("All workers stopped.")

if __name__ == "__main__":
    main()
